// backend/utils/apiKey.js
import crypto from "crypto";

export function generateApiKey() {
  return crypto.randomBytes(32).toString("hex"); // 64-char hex
}

export function hashApiKey(rawKey) {
  const secret = process.env.API_KEY_SECRET || "change_me_in_prod";
  const h = crypto.createHmac("sha256", secret);
  h.update(rawKey);
  return h.digest("hex");
}

export function safeCompare(a, b) {
  try {
    const A = Buffer.from(a, "utf8");
    const B = Buffer.from(b, "utf8");
    if (A.length !== B.length) return false;
    return crypto.timingSafeEqual(A, B);
  } catch {
    return false;
  }
}
