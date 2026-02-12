const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

/* ======================================================
   GENERATE TOTP SECRET
====================================================== */

async function generateTOTPSecret(email) {
  const secret = speakeasy.generateSecret({
    name: `LogScope (${email})`,
    length: 20,
  });

  const qr = await QRCode.toDataURL(secret.otpauth_url);

  return {
    base32: secret.base32,
    otpauth_url: secret.otpauth_url,
    qr,
  };
}

/* ======================================================
   VERIFY TOTP
====================================================== */

function verifyTOTP({ secretBase32, token }) {
  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: "base32",
    token,
    window: 1, // allow ±30 seconds drift
  });
}

module.exports = {
  generateTOTPSecret,
  verifyTOTP,
};
