const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const prisma = require("../utils/prisma");

/* =====================================================
   Helper: generate unique username
===================================================== */
async function generateUsername(base) {
  let username = base.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (username.length < 3) username = `user${Date.now()}`;

  let exists = await prisma.user.findUnique({ where: { username } });
  let suffix = 1;

  while (exists) {
    const candidate = `${username}${suffix}`;
    exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
    suffix++;
  }

  return username;
}

/* =====================================================
   GOOGLE STRATEGY
===================================================== */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Google account has no email"));
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          const username = await generateUsername(
            profile.displayName || email.split("@")[0]
          );

          user = await prisma.user.create({
            data: {
              email,
              username,
              provider: "google",
              emailVerified: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* =====================================================
   GITHUB STRATEGY
===================================================== */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.find((e) => e.primary)?.value
          || profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("GitHub account has no public email"));
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          const username = await generateUsername(
            profile.username || email.split("@")[0]
          );

          user = await prisma.user.create({
            data: {
              email,
              username,
              provider: "github",
              emailVerified: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
