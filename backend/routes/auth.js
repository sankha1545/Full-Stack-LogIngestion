const router = require("express").Router();
const prisma = require("../utils/prisma");
const rateLimiter = require("../middlewares/rateLimiter");
const requireAuth = require("../middlewares/requireAuth");

const { sendOtpEmail } = require("../utils/mailer");
const { hash, compare } = require("../utils/bcrypt");
const { sign, verify } = require("../utils/jwt");
const { generateRefreshToken, hashToken } = require("../utils/token");
const { encrypt, decrypt } = require("../utils/crypto");
const { verifyTOTP, generateTOTPSecret } = require("../utils/mfa");

const crypto = require("crypto");

/* ======================================================
   CONFIG
====================================================== */

const REFRESH_TOKEN_DAYS = 7;
const MFA_TEMP_EXPIRY = "5m";
const MFA_MAX_ATTEMPTS = 5;
const MFA_LOCK_MINUTES = 10;
const TRUST_DEVICE_DAYS = 30;
const RECOVERY_CODE_COUNT = 8;
const OTP_EXP_MINUTES = 10;

/* ======================================================
   UTIL HELPERS
====================================================== */

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
  });
}

function getDeviceHash(req) {
  const raw = `${req.ip}-${req.headers["user-agent"]}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function logAudit(userId, email, event, req) {
  await prisma.authAuditLog.create({
    data: {
      userId,
      email,
      event,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });
}

/* ======================================================
   TOKEN ISSUING
====================================================== */

async function issueTokens(user, res) {
  const accessToken = sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );

  const rawRefresh = generateRefreshToken();
  const refreshHash = hashToken(rawRefresh);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshHash,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  setRefreshCookie(res, rawRefresh);

  return accessToken;
}

/* ======================================================
   EMAIL OTP
====================================================== */

router.post("/send-otp", rateLimiter.auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ error: "Email required" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.emailOtp.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + OTP_EXP_MINUTES * 60 * 1000),
      },
    });

    await sendOtpEmail(email, code);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", rateLimiter.auth, async (req, res) => {
  try {
    const { email, code } = req.body;

    const record = await prisma.emailOtp.findFirst({
      where: {
        email,
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});

/* ======================================================
   LOGIN
====================================================== */

router.post("/login", rateLimiter.auth, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password)
      return res.status(401).json({ error: "Invalid credentials" });

    const valid = await compare(password, user.password);
    if (!valid) {
      await logAudit(null, email, "LOGIN_FAILED", req);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await logAudit(user.id, user.email, "LOGIN_SUCCESS", req);

    /* MFA REQUIRED */
    if (user.mfaEnabled) {
      const deviceHash = getDeviceHash(req);

      const trusted = await prisma.trustedDevice.findFirst({
        where: {
          userId: user.id,
          deviceHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (!trusted) {
        const tempToken = sign(
          { sub: user.id, email: user.email, mfa: "pending" },
          { expiresIn: MFA_TEMP_EXPIRY }
        );

        await logAudit(user.id, user.email, "MFA_REQUIRED", req);

        return res.json({
          mfaRequired: true,
          tempToken,
        });
      }
    }

    const token = await issueTokens(user, res);

res.json({
  token,
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
  },
});

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

/* ======================================================
   MFA VERIFY
====================================================== */

router.post("/mfa/verify", rateLimiter.auth, async (req, res) => {
  try {
    const { tempToken, code, rememberDevice } = req.body;

    const decoded = verify(tempToken);
    if (!decoded || decoded.mfa !== "pending")
      return res.status(401).json({ error: "Invalid session" });

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    let valid = false;

    if (user.mfaSecretEncrypted) {
      const secret = decrypt(user.mfaSecretEncrypted);
      valid = verifyTOTP({ secretBase32: secret, token: code });
    }

    if (!valid) {
      const recoveryCodes = await prisma.mfaRecoveryCode.findMany({
        where: { userId: user.id, used: false },
      });

      for (const recovery of recoveryCodes) {
        if (await compare(code, recovery.codeHash)) {
          valid = true;
          await prisma.mfaRecoveryCode.update({
            where: { id: recovery.id },
            data: { used: true, usedAt: new Date() },
          });
          break;
        }
      }
    }

    if (!valid) {
      await logAudit(user.id, user.email, "MFA_FAILED", req);
      return res.status(401).json({ error: "Invalid MFA code" });
    }

    await logAudit(user.id, user.email, "MFA_SUCCESS", req);

    if (rememberDevice) {
      await prisma.trustedDevice.create({
        data: {
          userId: user.id,
          deviceHash: getDeviceHash(req),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          expiresAt: new Date(
            Date.now() + TRUST_DEVICE_DAYS * 24 * 60 * 60 * 1000
          ),
        },
      });
    }

  const token = await issueTokens(user, res);

res.json({
  token,
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
  },
});

  } catch (err) {
    res.status(500).json({ error: "MFA verification failed" });
  }
});

/* ======================================================
   MFA SETUP (QR)
====================================================== */

const QRCode = require("qrcode");

router.post("/mfa/setup", requireAuth, async (req, res) => {
  try {
    const secretData = await generateTOTPSecret(req.user.email);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        mfaSecretEncrypted: encrypt(secretData.base32),
      },
    });

    res.json({
      qr: secretData.qr,
      secret: secretData.base32,
    });

  } catch (err) {
    console.error("MFA setup error:", err);
    res.status(500).json({ error: "MFA setup failed" });
  }
});



/* ======================================================
   VERIFY MFA SETUP
====================================================== */

router.post("/mfa/verify-setup", requireAuth, async (req, res) => {
  try {
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const secret = decrypt(user.mfaSecretEncrypted);

    if (!verifyTOTP({ secretBase32: secret, token: code }))
      return res.status(400).json({ error: "Invalid code" });

    const recoveryCodes = [];

    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
      const raw = crypto.randomBytes(4).toString("hex");
      recoveryCodes.push(raw);

      await prisma.mfaRecoveryCode.create({
        data: {
          userId: user.id,
          codeHash: await hash(raw),
        },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true },
    });

    res.json({ recoveryCodes });
  } catch (err) {
    res.status(500).json({ error: "MFA setup failed" });
  }
});

/* ======================================================
   DISABLE MFA
====================================================== */

router.post("/mfa/disable", requireAuth, async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      mfaEnabled: false,
      mfaSecretEncrypted: null,
    },
  });

  await prisma.mfaRecoveryCode.deleteMany({
    where: { userId: req.user.id },
  });

  res.json({ success: true });
});

/* ======================================================
   REGENERATE RECOVERY CODES
====================================================== */

router.post("/mfa/regenerate-recovery-codes", requireAuth, async (req, res) => {
  await prisma.mfaRecoveryCode.deleteMany({
    where: { userId: req.user.id },
  });

  const codes = [];

  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const raw = crypto.randomBytes(4).toString("hex");
    codes.push(raw);

    await prisma.mfaRecoveryCode.create({
      data: {
        userId: req.user.id,
        codeHash: await hash(raw),
      },
    });
  }

  res.json({ recoveryCodes: codes });
});

/* ======================================================
   REFRESH
====================================================== */

router.post("/refresh", async (req, res) => {
  try {
    const rawRefresh = req.cookies.refreshToken;
    if (!rawRefresh)
      return res.status(401).json({ error: "Unauthorized" });

    const hashed = hashToken(rawRefresh);

    const stored = await prisma.refreshToken.findFirst({
      where: {
        tokenHash: hashed,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored)
      return res.status(401).json({ error: "Invalid token" });

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const token = await issueTokens(stored.user, res);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Refresh failed" });
  }
});

/* ======================================================
   LOGOUT
====================================================== */

router.post("/logout", async (req, res) => {
  try {
    const rawRefresh = req.cookies.refreshToken;

    if (rawRefresh) {
      const hashed = hashToken(rawRefresh);

      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashed },
        data: { revoked: true },
      });
    }

    res.clearCookie("refreshToken", { path: "/api/auth" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = router;
