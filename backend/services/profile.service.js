const prisma = require("../utils/prisma");

async function getProfile(userId) {
  return prisma.userProfile.findFirst({
    where: { userId },
  });
}

async function upsertProfile(userId, data) {
  const payload = {
    firstName: data.firstName ?? undefined,
    lastName: data.lastName ?? undefined,
    username: data.username ?? undefined,
    country: data.country ?? undefined,
    countryCode: data.countryCode ?? undefined,
    state: data.state ?? undefined,
  };

  return prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...payload,
    },
    update: payload,
  });
}

module.exports = {
  getProfile,
  upsertProfile,
};
