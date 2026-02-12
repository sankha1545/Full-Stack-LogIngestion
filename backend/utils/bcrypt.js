/**
 * Password Security Utility
 *
 * Features:
 * - bcrypt hashing
 * - strong password validation
 * - configurable salt rounds
 * - safe comparison handling
 * - password policy enforcement
 * - future hash upgrade detection
 * - backward compatible
 */

const bcrypt = require("bcrypt");

// -----------------------------
// Config
// -----------------------------
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Password Policy
 * Must match frontend rules:
 * - min 10 characters
 * - uppercase
 * - lowercase
 * - number
 * - special char
 */
const PASSWORD_REGEX = {
  length: /.{10,}/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

/**
 * Validate password strength
 * Used during password change / signup
 */
exports.validatePasswordStrength = (password = "") => {
  const rules = {
    length: PASSWORD_REGEX.length.test(password),
    uppercase: PASSWORD_REGEX.uppercase.test(password),
    lowercase: PASSWORD_REGEX.lowercase.test(password),
    number: PASSWORD_REGEX.number.test(password),
    special: PASSWORD_REGEX.special.test(password),
  };

  const isValid = Object.values(rules).every(Boolean);

  return {
    isValid,
    rules,
    message: isValid
      ? "Valid password"
      : "Password must be 10+ chars with uppercase, lowercase, number, and special character",
  };
};

/**
 * Hash password
 * (Backwards compatible with your existing code)
 */
exports.hash = async (password) => {
  try {
    if (!password) throw new Error("Password required");

    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (err) {
    console.error("Password hash error:", err.message);
    throw new Error("Password hashing failed");
  }
};

/**
 * Compare password safely
 * Returns boolean
 */
exports.compare = async (password, hash) => {
  try {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
};

/**
 * Check if stored hash needs rehash
 * (future security upgrade support)
 */
exports.needsRehash = (hash) => {
  try {
    const rounds = bcrypt.getRounds(hash);
    return rounds < SALT_ROUNDS;
  } catch {
    return false;
  }
};

/**
 * Upgrade password hash if needed
 */
exports.rehashIfNeeded = async (password, existingHash) => {
  if (exports.needsRehash(existingHash)) {
    return await exports.hash(password);
  }
  return existingHash;
};
