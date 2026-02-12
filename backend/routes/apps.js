// backend/routes/apps.js

const express = require("express");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

/* =====================================================
   CONFIG
===================================================== */

const MAX_APPS_PER_USER = 20;

/**
 * Base ingestion endpoint
 * Example:
 * http://localhost:3001/api/logs/ingest
 */
const BASE_INGEST_URL =
  process.env.LOGSCOPE_INGEST_URL ||
  "http://localhost:3001/api/logs/ingest";

/* =====================================================
   HELPERS
===================================================== */

/**
 * Generate secure raw API key
 */
function generateApiKey() {
  return "ls_" + crypto.randomBytes(32).toString("hex");
}

/**
 * Hash API key for storage
 */
function hashApiKey(rawKey) {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) throw new Error("API_KEY_SECRET not configured");

  return crypto.createHmac("sha256", secret).update(rawKey).digest("hex");
}

/**
 * Generate key preview for UI
 * Example: ls_8f3a...91ab
 */
function generateKeyPreview(key) {
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

/**
 * Generate connection string for SDK usage
 */
function generateConnectionString(apiKey) {
  return `${BASE_INGEST_URL}?key=${apiKey}`;
}

/* =====================================================
   ACCESS CONTROL (STRICT MULTI-TENANT)
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
    include: {
      members: {
        where: { userId: user.id },
      },
    },
  });
}

function getUserAppRole(app, user) {
  if (!app) return null;
  if (user.role === "MASTER_ADMIN") return "OWNER";
  if (app.userId === user.id) return "OWNER";
  if (app.members?.length) return app.members[0].role;
  return null;
}

/* =====================================================
   CREATE APPLICATION (SAAS CORE)
===================================================== */

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, environment } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Application name required" });
    }

    // Block master admin from creating apps
    if (req.user.role === "MASTER_ADMIN") {
      return res.status(403).json({
        error: "Master admin cannot create applications",
      });
    }

    // Enforce per-user app limit
    const appCount = await prisma.application.count({
      where: {
        userId: req.user.id,
        deleted: false,
      },
    });

    if (appCount >= MAX_APPS_PER_USER) {
      return res.status(400).json({
        error: `Application limit reached (${MAX_APPS_PER_USER} max)`,
      });
    }

    /* ===============================
       Generate API key + connection
    =============================== */

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);
    const keyPreview = generateKeyPreview(rawKey);
    const connectionString = generateConnectionString(rawKey);

    /* ===============================
       Create application
    =============================== */

    const created = await prisma.application.create({
      data: {
        name: name.trim(),
        environment: environment || "DEVELOPMENT",
        userId: req.user.id,
        connectionUrl: BASE_INGEST_URL,
        apiKeys: {
          create: {
            keyHash,
            keyPreview,
          },
        },
      },
      select: {
        id: true,
        name: true,
        environment: true,
        createdAt: true,
        connectionUrl: true,
      },
    });

    return res.status(201).json({
      ...created,

      /**
       * Show only once to user
       */
      apiKey: rawKey,
      connectionString,

      message: "Save your API key securely. It will not be shown again.",
    });

  } catch (err) {
    console.error("Create app error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   LIST APPLICATIONS
===================================================== */

router.get("/", requireAuth, async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      where:
        req.user.role === "MASTER_ADMIN"
          ? { deleted: false }
          : {
              deleted: false,
              OR: [
                { userId: req.user.id },
                {
                  members: {
                    some: { userId: req.user.id },
                  },
                },
              ],
            },
      select: {
        id: true,
        name: true,
        environment: true,
        createdAt: true,
        connectionUrl: true,
        userId: req.user.role === "MASTER_ADMIN" ? true : false,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(apps);

  } catch (err) {
    console.error("List apps error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   GET SINGLE APPLICATION
===================================================== */

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const app = await getAppWithAccess(req.params.id, req.user);
    if (!app) return res.status(404).json({ error: "Not found" });

    const full = await prisma.application.findUnique({
      where: { id: app.id },
      include: {
        apiKeys: {
          select: {
            id: true,
            keyPreview: true,
            revoked: true,
            rotatedAt: true,
            createdAt: true,
          },
        },
      },
    });

    res.json(full);

  } catch (err) {
    console.error("Get app error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   ROTATE API KEY (ADMIN OR OWNER)
===================================================== */

router.post("/:id/rotate", requireAuth, async (req, res) => {
  try {
    const app = await getAppWithAccess(req.params.id, req.user);
    if (!app) return res.status(404).json({ error: "Not found" });

    const role = getUserAppRole(app, req.user);

    if (!["OWNER", "ADMIN"].includes(role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);
    const keyPreview = generateKeyPreview(rawKey);
    const connectionString = generateConnectionString(rawKey);

    // revoke old keys
    await prisma.apiKey.updateMany({
      where: {
        applicationId: app.id,
        revoked: false,
      },
      data: {
        revoked: true,
        rotatedAt: new Date(),
      },
    });

    // create new key
    await prisma.apiKey.create({
      data: {
        applicationId: app.id,
        keyHash,
        keyPreview,
      },
    });

    res.json({
      apiKey: rawKey,
      connectionString,
      message: "API key rotated successfully",
    });

  } catch (err) {
    console.error("Rotate key error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =====================================================
   SOFT DELETE APPLICATION (OWNER ONLY)
===================================================== */

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const app = await getAppWithAccess(req.params.id, req.user);
    if (!app) return res.status(404).json({ error: "Not found" });

    const role = getUserAppRole(app, req.user);

    if (role !== "OWNER") {
      return res.status(403).json({ error: "Only owner can delete app" });
    }

    await prisma.application.update({
      where: { id: app.id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Delete app error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
