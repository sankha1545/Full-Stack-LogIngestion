const router = require("express").Router();
const passport = require("passport");
const crypto = require("crypto");

const prisma = require("../utils/prisma");
const { sign } = require("../utils/jwt");
const { generateRefreshToken, hashToken } = require("../utils/token");

/* ======================================================
   CONFIG
====================================================== */

const REFRESH_TOKEN_DAYS = 7;
const MFA_TEMP_EXPIRY = "5m";
const TRUST_DEVICE_DAYS = 30;

/* ======================================================
   HELPERS
====================================================== */

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
  });
}

function getDeviceHash(req) {
  const raw = `${req.ip}-${req.headers["user-agent"]}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function issueTokens(user, res) {
  const accessToken = sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );

  const rawRefresh = generateRefreshToken();
  const refreshHash = hashToken(rawRefresh);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshHash,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  setRefreshCookie(res, rawRefresh);

  return accessToken;
}

function issueMfaTempToken(user) {
  return sign(
    {
      sub: user.id,
      email: user.email,
      mfa: "pending",
    },
    { expiresIn: MFA_TEMP_EXPIRY }
  );
}

/* ======================================================
   COMMON OAUTH HANDLER (FIXED)
====================================================== */

async function handleOAuthSuccess(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }

    /* ---------- LOCK CHECK ---------- */

    if (user.mfaLockedUntil && user.mfaLockedUntil > new Date()) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?locked=true`
      );
    }

    /* ---------- MFA CHECK WITH TRUSTED DEVICE ---------- */

    if (user.mfaEnabled) {
      const deviceHash = getDeviceHash(req);

      const trusted = await prisma.trustedDevice.findFirst({
        where: {
          userId: user.id,
          deviceHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (!trusted) {
        const tempToken = issueMfaTempToken(user);

        return res.redirect(
          `${process.env.FRONTEND_URL}/oauth/callback?mfaRequired=true&tempToken=${tempToken}`
        );
      }
    }

    /* ---------- NORMAL LOGIN ---------- */

    const accessToken = await issueTokens(user, res);

    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?token=${accessToken}`
    );

  } catch (err) {
    console.error("OAuth error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
}

/* ======================================================
   GOOGLE
====================================================== */

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  handleOAuthSuccess
);

/* ======================================================
   GITHUB
====================================================== */

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  handleOAuthSuccess
);

module.exports = router;
