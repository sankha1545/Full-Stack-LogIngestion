/**
 * Profile Service
 *
 * Features:
 * - Get user profile
 * - Upsert profile safely
 * - User existence validation
 * - Input sanitization
 * - Provider + security info support
 * - MFA status exposure
 * - Backward compatible
 */

const prisma = require("../utils/prisma");

/* ======================================================
   HELPERS
====================================================== */

/**
 * Ensure user exists
 */
async function ensureUserExists(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      provider: true,
      role: true,
      mfaEnabled: true,
      tokenVersion: true,
    },
  });

  if (!user) throw new Error("User not found");

  return user;
}

/**
 * Clean input payload
 * Prevents unwanted fields
 */
function sanitizeProfileInput(data = {}) {
  return {
    firstName: data.firstName ?? undefined,
    lastName: data.lastName ?? undefined,
    username: data.username ?? undefined,
    country: data.country ?? undefined,
    countryCode: data.countryCode ?? undefined,
    state: data.state ?? undefined,
  };
}

/* ======================================================
   GET PROFILE
====================================================== */

/**
 * Returns:
 * - profile data
 * - account security info (provider, mfa, role)
 */
async function getProfile(userId) {
  if (!userId) throw new Error("User ID required");

  const user = await ensureUserExists(userId);

  const profile = await prisma.userProfile.findFirst({
    where: { userId },
  });

  return {
    profile,
    account: {
      email: user.email,
      provider: user.provider || "credentials",
      role: user.role,
      mfaEnabled: user.mfaEnabled,
    },
  };
}

/* ======================================================
   UPSERT PROFILE
====================================================== */

/**
 * Creates or updates profile safely
 */
async function upsertProfile(userId, data) {
  if (!userId) throw new Error("User ID required");

  await ensureUserExists(userId);

  const payload = sanitizeProfileInput(data);

  return prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...payload,
    },
    update: payload,
  });
}

/* ======================================================
   ACCOUNT SECURITY INFO (NEW)
====================================================== */

/**
 * Used by frontend:
 * - detect OAuth vs email login
 * - check MFA status
 */
async function getAccountSecurityInfo(userId) {
  const user = await ensureUserExists(userId);

  return {
    email: user.email,
    provider: user.provider || "credentials",
    mfaEnabled: user.mfaEnabled,
    tokenVersion: user.tokenVersion,
  };
}

module.exports = {
  getProfile,
  upsertProfile,
  getAccountSecurityInfo,
};
