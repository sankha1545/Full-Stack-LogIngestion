const nodemailer = require("nodemailer");

/* --------------------------------------------------
   SMTP TRANSPORT (hMailServer compatible)
-------------------------------------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // 127.0.0.1
  port: Number(process.env.SMTP_PORT),  // 587
  secure: false,                        // false for 587
  auth: {
    user: process.env.SMTP_USER,        // no-reply@SignalHub.com
    pass: process.env.SMTP_PASS,        // mailbox password
  },
  tls: {
    rejectUnauthorized: false,          // REQUIRED for hMailServer
  },
});

/* --------------------------------------------------
   SEND OTP EMAIL
-------------------------------------------------- */
exports.sendOtpEmail = async (to, code) => {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Your SignalHub verification code",

    // ✅ PLAIN TEXT (CRITICAL)
    text: `
Your SignalHub verification code is: ${code}

This code expires in 10 minutes.

If you didn’t request this, you can safely ignore this email.
    `,

    // ✅ HTML (OPTIONAL, ENHANCED)
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>Verify your email</h2>
        <p>Your one-time verification code is:</p>
        <div style="
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 4px;
          margin: 16px 0;
        ">
          ${code}
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <hr />
        <p style="font-size:12px;color:#777">
          © SignalHub
        </p>
      </div>
    `,
  });

  console.log("📧 OTP email sent:", info.messageId);
};
