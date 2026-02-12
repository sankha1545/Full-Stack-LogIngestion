// backend/utils/crypto.js
const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const KEY = process.env.MFA_ENCRYPTION_KEY; // must be 32 bytes base64 or hex
if (!KEY) {
  throw new Error("MFA_ENCRYPTION_KEY must be set in env");
}
const KEY_BUF = Buffer.from(KEY, "base64"); // set as base64 encoded 32 bytes

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY_BUF, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(ciphertext) {
  const data = Buffer.from(ciphertext, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY_BUF, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encrypt, decrypt };
