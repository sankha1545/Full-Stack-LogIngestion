// backend/routes/mfa.js
const router = require("express").Router();
const requireAuth = require("../middlewares/requireAuth");
const prisma = require("../utils/prisma");
const rateLimiter = require("../middlewares/rateLimiter");
const { generateSecret, generateQrDataUrl, verifyTOTP } = require("../utils/mfa");
const { encrypt, decrypt } = require("../utils/crypto");
const { sign } = require("../utils/jwt");

// helper: create short-lived temp token for setup/verify
function signTempToken(payload) {
  // IMPORTANT: set very short expiry (e.g., 5m)
  return sign({ ...payload, mfa: "temp" }, { expiresIn: "5m" });
}

/* ---------------- START SETUP ----------------
   GET /api/mfa/setup
   returns { qrDataUrl, secretBase32 (optionally), mfaSetupToken }
   Note: secretBase32 should NOT be returned in production; return only qr
*/
router.post("/setup", requireAuth, rateLimiter.auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const account = req.user.email;
    const secret = generateSecret({ name: "LogScope", account });

    const qr = await generateQrDataUrl(secret.otpauth_url);

    // encrypt secret.base32 before storing
    const encrypted = encrypt(secret.base32);

    // store secret encrypted in DB with a flag mfaEnabled=false until verify
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecretEncrypted: encrypted,
      },
    });

    const setupToken = signTempToken({ sub: userId, type: "mfa-setup" });

    return res.json({
      qr,
      /* in dev you can return secret: secret.base32, */
      setupToken,
    });
  } catch (err) {
    console.error("MFA setup error:", err);
    res.status(500).json({ error: "Failed to generate MFA setup" });
  }
});

/* ---------------- VERIFY SETUP ----------------
   POST /api/mfa/verify-setup
   body: { setupToken, code }
*/
router.post("/verify-setup", rateLimiter.auth, async (req, res) => {
  try {
    const { setupToken, code } = req.body;
    if (!setupToken || !code) return res.status(400).json({ error: "Missing fields" });

    const decoded = require("../utils/jwt").verify(setupToken);
    if (!decoded || decoded.mfa !== "temp" || decoded.type !== "mfa-setup") {
      return res.status(401).json({ error: "Invalid or expired setup token" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user || !user.mfaSecretEncrypted) {
      return res.status(400).json({ error: "No MFA secret found" });
    }

    const secretBase32 = decrypt(user.mfaSecretEncrypted);

    const ok = verifyTOTP({ secretBase32, token: code });

    if (!ok) return res.status(400).json({ error: "Invalid code" });

    // mark mfa enabled, optionally generate recovery codes
    const recoveryCodes = Array.from({ length: 8 }).map(() =>
      require("crypto").randomBytes(4).toString("hex")
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        mfaRecoveryCodes: recoveryCodes,
      },
    });

    return res.json({ success: true, recoveryCodes });
  } catch (err) {
    console.error("MFA verify setup error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ---------------- DISABLE MFA ----------------
   POST /api/mfa/disable
   body: { code } (or require password for safety)
*/
router.post("/disable", requireAuth, rateLimiter.auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecretEncrypted) return res.status(400).json({ error: "MFA not enabled" });

    const secretBase32 = decrypt(user.mfaSecretEncrypted);

    const ok = verifyTOTP({ secretBase32, token: code });

    if (!ok) return res.status(401).json({ error: "Invalid code" });

    // disable and remove secret (or keep but mark disabled)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecretEncrypted: null,
        mfaRecoveryCodes: null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("MFA disable error:", err);
    res.status(500).json({ error: "Failed to disable MFA" });
  }
});

/* ---------------- VERIFY CHALLENGE (login flow)
   POST /api/mfa/verify
   body: { tempToken, code }
   Returns permanent access + refresh tokens.
*/
router.post("/verify", rateLimiter.auth, async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) return res.status(400).json({ error: "Missing fields" });

    // verify temp token (must be short-lived and mfa: "pending" style)
    const decoded = require("../utils/jwt").verify(tempToken);
    if (!decoded || decoded.mfa !== "pending") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.mfaEnabled || !user.mfaSecretEncrypted) {
      return res.status(400).json({ error: "MFA not configured" });
    }

    const secretBase32 = decrypt(user.mfaSecretEncrypted);
    const ok = verifyTOTP({ secretBase32, token: code });

    if (!ok) {
      return res.status(401).json({ error: "Invalid code" });
    }

    // on success issue permanent tokens (reuse your token code)
    const { signAccessTokenAndRefresh } = require("../utils/authTokens"); // implement helper to create access+refresh and set cookie
    const { accessToken } = await signAccessTokenAndRefresh(user, res);

    return res.json({
      token: accessToken,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    });

  } catch (err) {
    console.error("MFA verify login error:", err);
    res.status(500).json({ error: "Failed to verify MFA code" });
  }
});

module.exports = router;
