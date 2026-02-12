const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const prisma = require("../utils/prisma");
const { verify } = require("../utils/jwt");

/* =====================================================
   Helper: Generate Unique Username
===================================================== */

async function generateUsername(base) {
  let username = base.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (username.length < 3) {
    username = `user${Date.now()}`;
  }

  let exists = await prisma.user.findUnique({ where: { username } });
  let suffix = 1;

  while (exists) {
    const candidate = `${username}${suffix}`;
    exists = await prisma.user.findUnique({
      where: { username: candidate },
    });

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
     callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,

    },
    
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account has no email"));
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

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
console.log(
  "Google callback URL:",
  `${process.env.BACKEND_URL}/api/auth/google/callback`
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
        const email =
          profile.emails?.find((e) => e.primary)?.value ||
          profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("GitHub account has no public email"));
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

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

/* =====================================================
   JWT STRATEGY (Aligned With Hardened JWT)
===================================================== */

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      algorithms: ["HS256"],
    },

    async (payload, done) => {
      try {
        // 🔥 Payload must contain sub
        if (!payload.sub) {
          return done(null, false);
        }

        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
        });

      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
