const express = require("express");
const router = express.Router();

const requireAuth = require("../middlewares/requireAuth"); // FIXED PATH
const prisma = require("../utils/prisma");

/* --------------------------------------------------
   GET current user's profile
-------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      profile: user.profile || {},
    });

  } catch (err) {
    console.error("GET /api/profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* --------------------------------------------------
   UPDATE current user's profile
-------------------------------------------------- */
router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firstName,
      lastName,
      username,
      country,
      countryCode,
      state,
    } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "No profile data provided",
      });
    }

    /* ------------------------------------------
       Update username (if provided)
    ------------------------------------------ */

    if (username) {
      const normalizedUsername = username
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "");

      if (!/^[a-z0-9._-]{3,24}$/.test(normalizedUsername)) {
        return res.status(400).json({
          message: "Invalid username format",
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { username: normalizedUsername },
      });
    }

    /* ------------------------------------------
       Upsert profile safely
    ------------------------------------------ */

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        country: country ?? null,
        countryCode: countryCode ?? null,
        state: state ?? null,
      },
      create: {
        userId,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        country: country ?? null,
        countryCode: countryCode ?? null,
        state: state ?? null,
      },
    });

    return res.status(200).json(updatedProfile);

  } catch (err) {
    console.error("PUT /api/profile error:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

module.exports = router;
