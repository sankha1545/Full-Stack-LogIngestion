exports.otpEmailTemplate = ({ code, purpose = "Verification" }) => ({
  subject: `Your ${purpose} code`,
  text: `
Your ${purpose} code is: ${code}

This code expires in 10 minutes.

If you didn’t request this, you can safely ignore this email.
  `,
  html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:480px; margin:auto">
      <h2>${purpose}</h2>
      <p>Your one-time code is:</p>

      <div style="
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 6px;
        margin: 16px 0;
        text-align: center;
      ">
        ${code}
      </div>

      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn’t request this, you can safely ignore this email.</p>

      <hr />
      <p style="font-size:12px;color:#777;text-align:center">
        © SignalHub
      </p>
    </div>
  `,
});
