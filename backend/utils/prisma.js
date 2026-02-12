/**
 * Prisma Client Singleton
 *
 * Features:
 * - Singleton instance (prevents connection leaks)
 * - Dev hot-reload safe
 * - Production optimized logging
 * - Graceful shutdown handling
 * - Connection lifecycle management
 * - Enterprise reliability
 */

const { PrismaClient } = require("@prisma/client");

/* =====================================================
   CONFIG
===================================================== */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Prisma logging strategy
 */
const prismaLogConfig = isProduction
  ? ["error"]
  : ["query", "warn", "error"];

/* =====================================================
   CREATE CLIENT
===================================================== */

function createPrismaClient() {
  return new PrismaClient({
    log: prismaLogConfig,
  });
}

let prisma;

/**
 * Development: use global singleton (prevents multiple connections)
 * Production: always new instance
 */
if (isProduction) {
  prisma = createPrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

/* =====================================================
   GRACEFUL SHUTDOWN
===================================================== */

async function shutdown() {
  try {
    console.log("Disconnecting Prisma...");
    await prisma.$disconnect();
  } catch (err) {
    console.error("Prisma disconnect error:", err.message);
  }
}

/**
 * Handle process termination safely
 */
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("beforeExit", shutdown);

/* =====================================================
   HEALTH CHECK HELPER (optional use)
===================================================== */

/**
 * Optional DB health check
 * Can be used in /health endpoint
 */
prisma.healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

module.exports = prisma;
