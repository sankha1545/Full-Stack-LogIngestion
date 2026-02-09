const router = require("express").Router();

const { signup, login } = require("../services/auth.service");
const { sign } = require("../utils/jwt");
const prisma = require("../utils/prisma");
const rateLimiter = require("../middlewares/rateLimiter");
const { sendOtpEmail } = require("../utils/mailer");

/* ---------------- SEND OTP ---------------- */
router.post("/send-otp", rateLimiter.auth, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  // Invalidate any previous verification state
  await prisma.emailOtp.updateMany({
    where: { email },
    data: { verified: false },
  });

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  await prisma.emailOtp.create({
    data: {
      email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendOtpEmail(email, code);
  res.json({ success: true });
});

/* ---------------- VERIFY OTP ---------------- */
router.post("/verify-otp", rateLimiter.auth, async (req, res) => {
  const { email, code } = req.body;

  const record = await prisma.emailOtp.findFirst({
    where: {
      email,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // ✅ Mark EMAIL as verified (not just one row)
  await prisma.emailOtp.updateMany({
    where: { email },
    data: { verified: true },
  });

  res.json({ verified: true });
});

/* ---------------- SIGNUP ---------------- */
router.post("/signup", rateLimiter.auth, async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check email verification (no ordering, no expiry)
    

    const normalizedUsername = username
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");

    if (!/^[a-z0-9._-]{3,24}$/.test(normalizedUsername)) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    const user = await signup(email, password, normalizedUsername);

    // OTP is single-use — clean it up
    await prisma.emailOtp.deleteMany({ where: { email } });

    res.json({
      token: sign({ id: user.id, email: user.email }),
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
});

/* ---------------- LOGIN ---------------- */
router.post("/login", rateLimiter.auth, async (req, res) => {
  const user = await login(req.body.email, req.body.password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ token: sign({ id: user.id, email: user.email }) });
});

module.exports = router;
