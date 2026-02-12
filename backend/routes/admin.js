// backend/routes/admin.js

const express = require("express");
const prisma = require("../utils/prisma");
const requireAuth = require("../middlewares/requireAuth");
const requireMaster = require("../middlewares/requireMaster");

const router = express.Router();

/* =====================================================
   GET ALL USERS (Master Only)
===================================================== */

router.get("/users", requireAuth, requireMaster, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            applications: {
              where: { deleted: false },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);

  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* =====================================================
   MASTER DASHBOARD ANALYTICS
===================================================== */

router.get("/analytics", requireAuth, requireMaster, async (req, res) => {
  try {
    const [
      totalUsers,
      totalApps,
      totalLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.application.count({ where: { deleted: false } }),
      prisma.log.count(),
    ]);

    res.json({
      totalUsers,
      totalApps,
      totalLogs,
    });

  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* =====================================================
   PER-USER DETAIL VIEW
===================================================== */

router.get("/users/:id", requireAuth, requireMaster, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        applications: {
          where: { deleted: false },
          include: {
            _count: {
              select: { logs: true },
            },
          },
        },
        _count: {
          select: {
            authLogs: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("Admin user detail error:", err);
    res.status(500).json({ error: "Failed to fetch user detail" });
  }
});

module.exports = router;
