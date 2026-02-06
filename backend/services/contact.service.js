const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createContactRequest = async (payload) => {
  return prisma.contactRequest.create({
    data: payload,
  });
};
