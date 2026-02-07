// backend/services/auth.service.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { hash, compare } = require("../utils/bcrypt");

/**
 * Signup after OTP verification
 */
exports.signup = async (email, password, username) => {
  // 1. Ensure email was OTP-verified
  const verifiedOtp = await prisma.emailOtp.findFirst({
    where: {
      email,
      verified: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verifiedOtp) {
    throw new Error("Email not verified");
  }

  // 2. Prevent duplicate users
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  // 3. Hash password
  const passwordHash = await hash(password);

  // 4. Create user
  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      provider: "credentials",
    },
  });
};

/**
 * Login with email + password
 */
exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) return null;

  const ok = await compare(password, user.password);
  return ok ? user : null;
};
