const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* -------------------------------------------------
   CREATE SINGLE LOG
------------------------------------------------- */
exports.createLog = async (log) => {
  return prisma.log.create({
    data: {
      level: log.level,
      message: log.message,
      resourceId: log.resourceId,
      timestamp: new Date(log.timestamp),
      traceId: log.traceId,
      spanId: log.spanId,
      commit: log.commit,
      metadata: log.metadata,
    },
  });
};

/* -------------------------------------------------
   BULK INGEST LOGS (optional but powerful)
------------------------------------------------- */
exports.ingestLogs = async (logs) => {
  if (!Array.isArray(logs) || logs.length === 0) {
    return { count: 0 };
  }

  await prisma.log.createMany({
    data: logs.map((log) => ({
      level: log.level,
      message: log.message,
      resourceId: log.resourceId,
      timestamp: new Date(log.timestamp),
      traceId: log.traceId,
      spanId: log.spanId,
      commit: log.commit,
      metadata: log.metadata,
    })),
    skipDuplicates: false,
  });

  return { count: logs.length };
};

/* -------------------------------------------------
   QUERY LOGS WITH FILTERS
------------------------------------------------- */
exports.queryLogs = async (filters) => {
  const {
    level,
    search,
    resourceId,
    from,
    to,
    traceId,
    spanId,
    commit,
    caseSensitive,
  } = filters;

  const where = {};

  if (level) {
    where.level = { in: level.split(",") };
  }

  if (resourceId) {
    where.resourceId = {
      contains: resourceId,
      mode: "insensitive",
    };
  }

  if (traceId) where.traceId = traceId;
  if (spanId) where.spanId = spanId;
  if (commit) where.commit = commit;

  if (search) {
    where.message = {
      contains: search,
      mode: caseSensitive === "true" ? "default" : "insensitive",
    };
  }

  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }

  return prisma.log.findMany({
    where,
    orderBy: { timestamp: "desc" },
  });
};
