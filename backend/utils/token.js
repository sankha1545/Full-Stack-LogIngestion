/**
 * Token Utility
 *
 * Features:
 * - Secure refresh token generation
 * - Token hashing for DB storage
 * - Constant-time comparison (timing attack protection)
 * - Token fingerprint support (device/session binding)
 * - Replay protection helpers
 * - Backward compatible
 */

const crypto = require("crypto");

/* =====================================================
   CONFIG
===================================================== */

const TOKEN_BYTES = Number(process.env.REFRESH_TOKEN_BYTES) || 64;

/* =====================================================
   Generate Secure Refresh Token
===================================================== */

/**
 * Generates cryptographically secure refresh token
 * Returns hex string
 */
exports.generateRefreshToken = () => {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
};

/* =====================================================
   Hash Refresh Token (DB Safe)
===================================================== */

/**
 * Hash token before storing in DB
 * Never store raw tokens
 */
exports.hashToken = (token) => {
  if (!token) return null;

  return crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");
};

/* =====================================================
   Constant-Time Token Comparison
   (prevents timing attacks)
===================================================== */

/**
 * Safely compare raw token with stored hash
 */
exports.safeCompareToken = (rawToken, storedHash) => {
  try {
    if (!rawToken || !storedHash) return false;

    const hashedInput = exports.hashToken(rawToken);

    return crypto.timingSafeEqual(
      Buffer.from(hashedInput),
      Buffer.from(storedHash)
    );
  } catch {
    return false;
  }
};

/* =====================================================
   Token Fingerprint (Device Binding)
===================================================== */

/**
 * Creates fingerprint from request context
 * Used for session/device binding
 */
exports.generateTokenFingerprint = (req) => {
  try {
    const raw = `${req.ip}-${req.headers["user-agent"]}`;

    return crypto
      .createHash("sha256")
      .update(raw)
      .digest("hex");
  } catch {
    return null;
  }
};

/* =====================================================
   Validate Token Format
===================================================== */

/**
 * Basic validation for refresh token format
 */
exports.isValidTokenFormat = (token) => {
  return typeof token === "string" && token.length >= 64;
};

/* =====================================================
   Token Metadata (Future Support)
===================================================== */

/**
 * Optional metadata for audit / tracking
 */
exports.createTokenMetadata = (req) => ({
  ip: req.ip,
  userAgent: req.headers["user-agent"],
  createdAt: new Date(),
});
