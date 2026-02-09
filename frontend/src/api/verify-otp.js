// POST /api/auth/verify-otp
import { prisma } from "@/lib/prisma";

export async function verifyOtp(req, res) {
  const { email, code } = req.body;

  const otp = await prisma.emailOtp.findFirst({
    where: {
      email,
      code,
      expiresAt: { gt: new Date() },
      verified: false,
    },
  });

  if (!otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // 1️⃣ Mark OTP verified
  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  // 2️⃣ Ensure user exists + mark email verified
  await prisma.user.upsert({
    where: { email },
    update: { emailVerified: true },
    create: {
      email,
      emailVerified: true,
      provider: "credentials",
    },
  });

  return res.json({ verified: true });
}
