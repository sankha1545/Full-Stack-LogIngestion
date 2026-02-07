// backend/utils/prisma.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error", "warn"], // optional but helpful
});

module.exports = prisma;
