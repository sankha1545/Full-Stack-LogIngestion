/**
 * JWT Utility
 *
 * Features:
 * - Token signing & verification
 * - OAuth provider support (credentials/google/github)
 * - Token versioning for forced logout after password change
 * - Safer verification handling
 * - Backward compatible with existing usage
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Sign JWT token
 *
 * @param {Object} payload
 * Supported fields:
 * - id / userId
 * - role
 * - provider (credentials/google/github)
 * - tokenVersion (for session invalidation)
 */
exports.sign = (payload = {}) => {
  try {
    return jwt.sign(
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      {
        expiresIn: EXPIRES_IN,
      }
    );
  } catch (err) {
    console.error("JWT Sign Error:", err.message);
    throw new Error("Token generation failed");
  }
};

/**
 * Verify JWT token
 * Returns decoded payload or null (never crashes server)
 */
exports.verify = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * Helper: create auth payload
 * Ensures consistent token structure across app
 *
 * @param {Object} user
 */
exports.createAuthPayload = (user) => ({
  id: user.id,
  role: user.role || "user",
  provider: user.provider || "credentials",
  tokenVersion: user.tokenVersion || 0,
});

/**
 * Helper: check token validity against DB token version
 * Used to force logout after password change.
 *
 * Example:
 * if (!isTokenValid(decoded, user.tokenVersion)) -> reject
 */
exports.isTokenValid = (decodedToken, currentTokenVersion) => {
  if (!decodedToken) return false;
  return decodedToken.tokenVersion === currentTokenVersion;
};
