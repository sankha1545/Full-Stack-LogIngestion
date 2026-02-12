// backend/utils/token.js

const crypto = require("crypto");

/* =====================================================
   Generate Secure Refresh Token
===================================================== */

exports.generateRefreshToken = () =>
  crypto.randomBytes(64).toString("hex");

/* =====================================================
   Hash Refresh Token (DB Safe)
===================================================== */

exports.hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
