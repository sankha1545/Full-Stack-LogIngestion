// backend/routes/logs.js

const express = require("express");
const router = express.Router();
const { z } = require("zod");
const crypto = require("crypto");

const prisma = require("../utils/prisma");
const requireAuth = require("../middlewares/requireAuth");

/* =====================================================
   HELPERS
===================================================== */

/**
 * Hash API key for verification
 */
function hashApiKey(rawKey) {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) throw new Error("API_KEY_SECRET not configured");

  return crypto.createHmac("sha256", secret).update(rawKey).digest("hex");
}

/**
 * Extract API key from request
 * Supports:
 * - Authorization: Bearer xxx
 * - x-api-key header
 * - query ?key=
 */
function extractApiKey(req) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.headers["x-api-key"] || req.query.key || null;
}

/**
 * Normalize log level → match Prisma enum
 */
function normalizeLogLevel(level) {
  if (!level) return "INFO";
  return level.toUpperCase();
}

/* =====================================================
   ACCESS CONTROL
===================================================== */

async function getAppWithAccess(appId, user) {
  if (user.role === "MASTER_ADMIN") {
    return prisma.application.findFirst({
      where: { id: appId, deleted: false },
    });
  }

  return prisma.application.findFirst({
    where: {
      id: appId,
      deleted: false,
      OR: [
        { userId: user.id },
        {
          members: {
            some: { userId: user.id },
          },
        },
      ],
    },
  });
}

/* =====================================================
   VALIDATION SCHEMAS
===================================================== */

const LogSchema = z.object({
  level: z.enum(["error", "warn", "info", "debug"]).optional(),
  message: z.string().min(1),
  resourceId: z.string().optional(),
  timestamp: z.string().datetime(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  commit: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Supports single log OR batch logs
 */
const IngestSchema = z.union([
  LogSchema,
  z.array(LogSchema).min(1),
]);

const QuerySchema = z.object({
  applicationId: z.string(),
  level: z.string().optional(),
  search: z.string().optional(),
  resourceId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  commit: z.string().optional(),
  caseSensitive: z.enum(["true", "false"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

/* =====================================================
   INGEST LOGS (API KEY BASED — SAAS CORE)
===================================================== */

router.post("/ingest", async (req, res) => {
  const apiKey = extractApiKey(req);

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  const parsed = IngestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid log format" });
  }

  try {
    const keyHash = hashApiKey(apiKey);

    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash,
        revoked: false,
        application: { deleted: false },
      },
      include: { application: true },
    });

    if (!keyRecord) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const logsArray = Array.isArray(parsed.data)
      ? parsed.data
      : [parsed.data];

    /* ------------------------------------------
       Insert logs
    ------------------------------------------ */

    const createdLogs = await prisma.$transaction(
      logsArray.map((log) =>
        prisma.log.create({
          data: {
            ...log,
            level: normalizeLogLevel(log.level),
            timestamp: new Date(log.timestamp),
            applicationId: keyRecord.applicationId,
          },
        })
      )
    );

    /* ------------------------------------------
       Realtime push (WebSocket)
    ------------------------------------------ */

    const io = req.app.get("io");
    if (io) {
      createdLogs.forEach((log) => {
        io.to(`app:${keyRecord.applicationId}`).emit("new_log", log);
      });
    }

    return res.status(201).json({
      success: true,
      count: createdLogs.length,
    });

  } catch (err) {
    console.error("Ingest failed:", err);
    return res.status(500).json({ error: "Failed to save log" });
  }
});

/* =====================================================
   GET LOGS (STRICT MULTI-TENANT)
===================================================== */

router.get("/", requireAuth, async (req, res) => {
  const parsedQuery = QuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const {
    applicationId,
    from,
    to,
    page = "1",
    limit = "50",
  } = parsedQuery.data;

  if (from && to && new Date(from) > new Date(to)) {
    return res.status(400).json({
      error: "From date should not be greater than To date",
    });
  }

  try {
    /* ------------------------------------------
       Access validation
    ------------------------------------------ */

    const app = await getAppWithAccess(applicationId, req.user);

    if (!app) {
      return res.status(403).json({ error: "Access denied" });
    }

    /* ------------------------------------------
       Pagination
    ------------------------------------------ */

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const skip = (pageNum - 1) * limitNum;

    /* ------------------------------------------
       Build WHERE clause
    ------------------------------------------ */

    const where = {
      applicationId: app.id,
    };

    if (parsedQuery.data.level) {
      where.level = parsedQuery.data.level.toUpperCase();
    }

    if (parsedQuery.data.resourceId) {
      where.resourceId = {
        contains: parsedQuery.data.resourceId,
        mode: "insensitive",
      };
    }

    if (parsedQuery.data.traceId) where.traceId = parsedQuery.data.traceId;
    if (parsedQuery.data.spanId) where.spanId = parsedQuery.data.spanId;
    if (parsedQuery.data.commit) where.commit = parsedQuery.data.commit;

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    if (parsedQuery.data.search) {
      where.message = {
        contains: parsedQuery.data.search,
        mode:
          parsedQuery.data.caseSensitive === "true"
            ? "default"
            : "insensitive",
      };
    }

    /* ------------------------------------------
       Query DB
    ------------------------------------------ */

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.log.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: logs,
    });

  } catch (err) {
    console.error("GET logs failed:", err);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;
