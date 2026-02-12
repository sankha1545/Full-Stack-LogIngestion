// backend/routes/logs.js

const express = require("express");
const router = express.Router();
const { z } = require("zod");
const crypto = require("crypto");

const prisma = require("../utils/prisma");
const requireAuth = require("../middlewares/requireAuth");

/* =====================================================
   Helpers
===================================================== */

function hashApiKey(rawKey) {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error("API_KEY_SECRET not configured");
  }
  return crypto.createHmac("sha256", secret).update(rawKey).digest("hex");
}

/* =====================================================
   Access Control
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
   Schemas
===================================================== */

const LogSchema = z.object({
  level: z.enum(["error", "warn", "info", "debug"]),
  message: z.string().min(1),
  resourceId: z.string().optional(),
  timestamp: z.string().datetime(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  commit: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

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
   INGEST LOGS (API KEY BASED)
===================================================== */

router.post("/ingest", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  const parsed = LogSchema.safeParse(req.body);
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

    const log = await prisma.log.create({
      data: {
        ...parsed.data,
        timestamp: new Date(parsed.data.timestamp),
        applicationId: keyRecord.applicationId,
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`app:${keyRecord.applicationId}`).emit("new_log", log);
    }

    return res.status(201).json({ success: true, id: log.id });

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
       Strict Access Validation
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
       Build WHERE
    ------------------------------------------ */

    const where = {
      applicationId: app.id, // enforce resolved ID
    };

    if (parsedQuery.data.level) {
      where.level = parsedQuery.data.level;
    }

    if (parsedQuery.data.resourceId) {
      where.resourceId = {
        contains: parsedQuery.data.resourceId,
        mode: "insensitive",
      };
    }

    if (parsedQuery.data.traceId) {
      where.traceId = parsedQuery.data.traceId;
    }

    if (parsedQuery.data.spanId) {
      where.spanId = parsedQuery.data.spanId;
    }

    if (parsedQuery.data.commit) {
      where.commit = parsedQuery.data.commit;
    }

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
       Query
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
