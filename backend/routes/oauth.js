const router = require("express").Router();
const passport = require("passport");
const { sign } = require("../utils/jwt");

/* ---------------- GOOGLE ---------------- */

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
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    const token = sign({
      id: req.user.id,
      email: req.user.email,
    });

    // Redirect back to frontend with token
    res.redirect(
      `http://localhost:5173/oauth/callback?token=${token}`
    );
  }
);

/* ---------------- GITHUB ---------------- */

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
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    const token = sign({
      id: req.user.id,
      email: req.user.email,
    });

    res.redirect(
      `http://localhost:5173/oauth/callback?token=${token}`
    );
  }
);

module.exports = router;
