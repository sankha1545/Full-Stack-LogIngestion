/**
 * backend/routes/auth.js
 *
 * Production-ready authentication routes:
 * - login (with brute-force protection & account lock)
 * - MFA: setup, verify-setup, verify, disable, regenerate recovery codes
 * - Email OTP: send/verify (secure 4-digit OTP)
 * - Password change (verify + change) with tokenVersion bump and refresh revocation
 * - Refresh + logout
 *
 * Responses preserve existing shapes where practical.
 */

const router = require("express").Router();
const prisma = require("../utils/prisma");
const rateLimiter = require("../middlewares/rateLimiter");
const requireAuth = require("../middlewares/requireAuth");

const { sendOtpEmail } = require("../utils/mailer");
const { hash, compare, validatePasswordStrength } = require("../utils/bcrypt");
const { sign, verify } = require("../utils/jwt");
const { generateRefreshToken, hashToken } = require("../utils/token");
const { encrypt, decrypt } = require("../utils/crypto");
const { verifyTOTP, generateTOTPSecret } = require("../utils/mfa");

const crypto = require("crypto");

/* ======================================================
   CONFIG / CONSTANTS
====================================================== */

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 7;
const MFA_TEMP_EXPIRY = process.env.MFA_TEMP_EXPIRY || "5m";
const TRUST_DEVICE_DAYS = Number(process.env.TRUST_DEVICE_DAYS) || 30;
const RECOVERY_CODE_COUNT = Number(process.env.RECOVERY_CODE_COUNT) || 8;
const OTP_EXP_MINUTES = Number(process.env.OTP_EXP_MINUTES) || 10;

const MAX_FAILED_LOGIN = Number(process.env.MAX_FAILED_LOGIN) || 5;
const LOCK_MINUTES = Number(process.env.ACCOUNT_LOCK_MINUTES) || 15;

/* ======================================================
   HELPERS
====================================================== */

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", { path: "/api/auth" });
}

function getDeviceHash(req) {
  const raw = `${req.ip}-${req.headers["user-agent"] || ""}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function logAudit(userId, email, event, req) {
  try {
    await prisma.authAuditLog.create({
      data: {
        userId: userId || null,
        email: email || (req && req.body && req.body.email) || null,
        event,
        ip: (req && req.ip) || null,
        userAgent: (req && req.headers && req.headers["user-agent"]) || null,
      },
    });
  } catch (err) {
    // Do not throw; failure to log should not break the flow
    console.error("Audit log failed:", err?.message || err);
  }
}

/* ======================================================
   TOKEN ISSUING (tokenVersion + provider)
====================================================== */

async function issueTokens(user, res) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider || "credentials",
    tokenVersion: user.tokenVersion || 0,
  };

  const accessToken = sign(payload); // your jwt util handles expiry

  const rawRefresh = generateRefreshToken();
  const refreshHash = hashToken(rawRefresh);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  setRefreshCookie(res, rawRefresh);

  return accessToken;
}

/* ======================================================
   PASSWORD FLOW: VERIFY CURRENT PASSWORD
====================================================== */

router.post("/password/verify", requireAuth, rateLimiter.auth, async (req, res) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) return res.status(400).json({ error: "Password required" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user || !user.password) {
      // passwordless / oauth account
      return res.status(400).json({ error: "Password change unavailable for OAuth users" });
    }

    const valid = await compare(currentPassword, user.password);

    if (!valid) {
      // increment failed login attempts (defensive)
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
      }).catch(() => {});

      await logAudit(user.id, user.email, "PASSWORD_VERIFY_FAILED", req);
      return res.status(401).json({ error: "Incorrect password" });
    }

    // reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0 },
    }).catch(() => {});

    await logAudit(user.id, user.email, "PASSWORD_VERIFY_SUCCESS", req);
    return res.json({ success: true });
  } catch (err) {
    console.error("Password verify error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

/* ======================================================
   PASSWORD CHANGE
   - server-side strength validation
   - hash stored password
   - bump tokenVersion and revoke refresh tokens (force re-login)
====================================================== */

router.post("/password/change", requireAuth, rateLimiter.auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "New password required" });

    const check = validatePasswordStrength(newPassword);
    if (!check.isValid) return res.status(400).json({ error: check.message });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.password) {
      return res.status(400).json({ error: "Password change unavailable for OAuth users" });
    }

    const hashed = await hash(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          tokenVersion: { increment: 1 },
          passwordChangedAt: new Date(),
        },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    await logAudit(user.id, user.email, "PASSWORD_CHANGED", req);

    clearRefreshCookie(res);

    return res.json({ success: true, message: "Password updated. Please login again." });
  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json({ error: "Password change failed" });
  }
});

/* ======================================================
   EMAIL OTP (secure 4-digit OTP generation)
====================================================== */

router.post("/send-otp", rateLimiter.auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // secure 4-digit OTP (1000-9999)
    const code = crypto.randomInt(1000, 10000).toString();

    await prisma.emailOtp.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + OTP_EXP_MINUTES * 60 * 1000),
      },
    });

    // best-effort send; don't leak mailer errors to client
    try {
      await sendOtpEmail(email, code);
    } catch (mailErr) {
      console.error("sendOtpEmail failed:", mailErr?.message || mailErr);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", rateLimiter.auth, async (req, res) => {
  try {
    let { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // sanitize input
    code = String(code).trim();

    /**
     * Get latest OTP for email
     */
    const record = await prisma.emailOtp.findFirst({
      where: {
        email,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return res.status(400).json({ error: "OTP not found" });
    }

    /**
     * Check code match
     */
    if (record.code !== code) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    /**
     * Check expiry (safe comparison)
     */
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    /**
     * Mark verified
     */
    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("verify-otp error:", err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});


/* ======================================================
   LOGIN — with brute-force protection & account lock
====================================================== */

router.post("/login", rateLimiter.auth, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const user = await prisma.user.findUnique({ where: { email } });

    // avoid user enumeration: generic message
    if (!user || !user.password) {
      await logAudit(null, email, "LOGIN_FAILED", req);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // check account lock
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      await logAudit(user.id, user.email, "ACCOUNT_LOCKED", req);
      return res.status(423).json({ error: "Account locked. Try later." });
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      // bump failed attempts
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
        select: { failedLoginAttempts: true },
      });

      const attempts = (updated?.failedLoginAttempts || 0);
      if (attempts >= MAX_FAILED_LOGIN) {
        const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: { accountLockedUntil: lockUntil, failedLoginAttempts: 0 },
        });
        await logAudit(user.id, user.email, "ACCOUNT_LOCKED", req);
        return res.status(423).json({ error: `Account locked for ${LOCK_MINUTES} minutes` });
      }

      await logAudit(user.id, user.email, "LOGIN_FAILED", req);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // successful login -> reset counters
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, accountLockedUntil: null },
    }).catch(() => {});

    await logAudit(user.id, user.email, "LOGIN_SUCCESS", req);

    // MFA check: trusted devices bypass
    if (user.mfaEnabled) {
      const deviceHash = getDeviceHash(req);
      const trusted = await prisma.trustedDevice.findFirst({
        where: { userId: user.id, deviceHash, expiresAt: { gt: new Date() } },
      });

      if (!trusted) {
        // generate short-lived temp token (server jwt util should support expiry via env)
        const tempToken = sign({ sub: user.id, email: user.email, mfa: "pending" }, /* options inside sign */);
        await logAudit(user.id, user.email, "MFA_REQUIRED", req);
        return res.json({ mfaRequired: true, tempToken });
      }
    }

    const token = await issueTokens(user, res);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        provider: user.provider || "credentials",
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/* ======================================================
   MFA: verify (complete MFA using temp token)
====================================================== */

router.post("/mfa/verify", rateLimiter.auth, async (req, res) => {
  try {
    const { tempToken, code, rememberDevice } = req.body;
    if (!tempToken || !code) return res.status(400).json({ error: "Missing fields" });

    const decoded = verify(tempToken);
    if (!decoded || decoded.mfa !== "pending") return res.status(401).json({ error: "Invalid session" });

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) return res.status(401).json({ error: "Invalid session" });

    let valid = false;

    if (user.mfaSecretEncrypted) {
      const secret = decrypt(user.mfaSecretEncrypted);
      try {
        valid = verifyTOTP({ secretBase32: secret, token: code });
      } catch (e) {
        valid = false;
      }
    }

    // fallback: recovery codes
    if (!valid) {
      const recoveryCodes = await prisma.mfaRecoveryCode.findMany({
        where: { userId: user.id, used: false },
      });

      for (const rc of recoveryCodes) {
        if (await compare(code, rc.codeHash)) {
          valid = true;
          await prisma.mfaRecoveryCode.update({ where: { id: rc.id }, data: { used: true, usedAt: new Date() } });
          break;
        }
      }
    }

    if (!valid) {
      await logAudit(user.id, user.email, "MFA_FAILED", req);
      return res.status(401).json({ error: "Invalid MFA code" });
    }

    if (rememberDevice) {
      await prisma.trustedDevice.create({
        data: {
          userId: user.id,
          deviceHash: getDeviceHash(req),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          expiresAt: new Date(Date.now() + TRUST_DEVICE_DAYS * 24 * 60 * 60 * 1000),
        },
      });
    }

    await logAudit(user.id, user.email, "MFA_SUCCESS", req);

    const token = await issueTokens(user, res);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("mfa verify error:", err);
    return res.status(500).json({ error: "MFA verification failed" });
  }
});

/* ======================================================
   MFA: setup — generate secret & return QR
====================================================== */

const QRCode = require("qrcode");

router.post("/mfa/setup", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const secretData = await generateTOTPSecret(req.user.email);

    // store encrypted secret
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecretEncrypted: encrypt(secretData.base32) },
    });

    return res.json({ qr: secretData.qr, secret: secretData.base32 });
  } catch (err) {
    console.error("mfa setup error:", err);
    return res.status(500).json({ error: "MFA setup failed" });
  }
});

/* ======================================================
   MFA: verify setup — enable & generate recovery codes
====================================================== */

router.post("/mfa/verify-setup", requireAuth, rateLimiter.auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.mfaSecretEncrypted) return res.status(400).json({ error: "MFA not initiated" });

    const secret = decrypt(user.mfaSecretEncrypted);

    if (!verifyTOTP({ secretBase32: secret, token: code })) {
      return res.status(400).json({ error: "Invalid code" });
    }

    const recoveryCodes = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
      const raw = crypto.randomBytes(4).toString("hex");
      recoveryCodes.push(raw);
      await prisma.mfaRecoveryCode.create({
        data: { userId: user.id, codeHash: await hash(raw) },
      });
    }

    await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: true } });

    await logAudit(user.id, user.email, "MFA_SETUP_COMPLETED", req);

    return res.json({ recoveryCodes });
  } catch (err) {
    console.error("mfa verify-setup error:", err);
    return res.status(500).json({ error: "MFA setup verification failed" });
  }
});

/* ======================================================
   MFA: disable
====================================================== */

router.post("/mfa/disable", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: false, mfaSecretEncrypted: null, mfaFailedAttempts: 0, mfaLockedUntil: null },
      }),
      prisma.mfaRecoveryCode.deleteMany({ where: { userId } }),
      prisma.trustedDevice.deleteMany({ where: { userId } }),
    ]);

    await logAudit(userId, req.user.email, "MFA_DISABLED", req);

    return res.json({ success: true });
  } catch (err) {
    console.error("mfa disable error:", err);
    return res.status(500).json({ error: "Failed to disable MFA" });
  }
});

/* ======================================================
   MFA: regenerate recovery codes
====================================================== */

router.post("/mfa/regenerate-recovery-codes", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.mfaRecoveryCode.deleteMany({ where: { userId } });

    const codes = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
      const raw = crypto.randomBytes(4).toString("hex");
      codes.push(raw);
      await prisma.mfaRecoveryCode.create({
        data: { userId, codeHash: await hash(raw) },
      });
    }

    await logAudit(userId, req.user.email, "RECOVERY_CODES_REGENERATED", req);

    return res.json({ recoveryCodes: codes });
  } catch (err) {
    console.error("regenerate recovery codes error:", err);
    return res.status(500).json({ error: "Failed to regenerate recovery codes" });
  }
});

/* ======================================================
   REFRESH + LOGOUT
====================================================== */

router.post("/refresh", async (req, res) => {
  try {
    const rawRefresh = req.cookies.refreshToken;
    if (!rawRefresh) return res.status(401).json({ error: "Unauthorized" });

    const hashed = hashToken(rawRefresh);

    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash: hashed, revoked: false, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) return res.status(401).json({ error: "Invalid token" });

    // revoke used refresh token (rotate)
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const token = await issueTokens(stored.user, res);

    return res.json({ token });
  } catch (err) {
    console.error("refresh error:", err);
    return res.status(500).json({ error: "Refresh failed" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const rawRefresh = req.cookies.refreshToken;
    if (rawRefresh) {
      const hashed = hashToken(rawRefresh);
      await prisma.refreshToken.updateMany({ where: { tokenHash: hashed }, data: { revoked: true } });
    }

    clearRefreshCookie(res);

    return res.json({ success: true });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = router;
