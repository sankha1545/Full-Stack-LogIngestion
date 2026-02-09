// backend/services/auth.service.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { hash, compare } = require("../utils/bcrypt");

/**
 * SIGNUP SERVICE
 * ❌ NO router
 * ❌ NO req / res
 * ❌ NO middleware
 */
exports.signup = async (email, password, username) => {
  const normalizedUsername = username
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");

  if (!/^[a-z0-9._-]{3,24}$/.test(normalizedUsername)) {
    throw new Error("Invalid username format");
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username: normalizedUsername }],
    },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      username: normalizedUsername,
      password: passwordHash,
      provider: "credentials",
      emailVerified: true,
    },
  });

  // OTP is irrelevant after signup
  await prisma.emailOtp.deleteMany({ where: { email } });

  return user;
};

/**
 * LOGIN SERVICE
 */
exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) return null;

  const ok = await compare(password, user.password);
  return ok ? user : null;
};
