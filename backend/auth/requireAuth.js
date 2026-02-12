/**
 * Auth Middleware
 *
 * Features:
 * - Bearer token verification
 * - Token version validation (force logout after password change)
 * - OAuth provider support
 * - Safe token handling
 * - DB user validation
 * - Backward compatible
 */

const { verify, isTokenValid } = require("../utils/jwt");
const prisma = require("../utils/prisma");

/**
 * Require authenticated user
 */
module.exports = async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // -------------------------------
    // Check Authorization Header
    // -------------------------------
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // -------------------------------
    // Verify JWT
    // -------------------------------
    const decoded = verify(token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Support both legacy and new payloads
    const userId = decoded.sub || decoded.id;

    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // -------------------------------
    // Fetch User From DB
    // -------------------------------
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        provider: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // -------------------------------
    // Token Version Validation
    // (forces logout after password change)
    // -------------------------------
    if (!isTokenValid(decoded, user.tokenVersion)) {
      return res.status(401).json({
        error: "Session expired. Please login again.",
      });
    }

    // -------------------------------
    // Attach User To Request
    // -------------------------------
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      provider: user.provider || "credentials",
    };

    next();

  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
