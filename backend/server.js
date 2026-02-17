require("dotenv").config();

/* ==================================================
   IMPORTS
================================================== */

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const { verify } = require("./utils/jwt");
const prisma = require("./utils/prisma");

/* ==================================================
   PASSPORT CONFIG
================================================== */

require("./auth/passport");

/* ==================================================
   EXPRESS INIT
================================================== */

const app = express();

/* Disable etag to avoid caching issues */
app.disable("etag");


/* ==================================================
   SECURITY MIDDLEWARE
================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(morgan("dev"));

app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());

app.use(passport.initialize());


/* ==================================================
   CORS CONFIG
================================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {

      if (!origin || allowedOrigins.includes(origin)) {

        return callback(null, true);

      }

      console.warn("Blocked CORS:", origin);

      return callback(new Error("Not allowed by CORS"));

    },

    credentials: true,

  })
);


/* ==================================================
   RATE LIMITING
================================================== */

const apiLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

});

app.use("/api", apiLimiter);


/* Higher limit for log ingestion */

const ingestLimiter = rateLimit({

  windowMs: 60 * 1000,

  max: 200,

});

app.use("/api/logs/ingest", ingestLimiter);



/* ==================================================
   ROUTES
================================================== */

const logsRouter = require("./routes/logs");

const contactRouter = require("./routes/contact");

const geoRouter = require("./routes/geo");

const authRouter = require("./routes/auth");

const oauthRouter = require("./routes/oauth");

const profileRouter = require("./routes/profile");

const appsRouter = require("./routes/apps");

const adminRouter = require("./routes/admin");


app.use("/api/auth", authRouter);

app.use("/api/auth", oauthRouter);

app.use("/api/profile", profileRouter);

app.use("/api/apps", appsRouter);

app.use("/api/logs", logsRouter);

app.use("/api/contact", contactRouter);

app.use("/api/geo", geoRouter);

app.use("/api/admin", adminRouter);



/* ==================================================
   HEALTH CHECK
================================================== */

app.get("/health", (_, res) => {

  res.status(200).json({

    status: "ok",

    uptime: process.uptime(),

    timestamp: new Date().toISOString(),

  });

});



/* ==================================================
   SOCKET.IO SERVER
================================================== */

if (process.env.NODE_ENV !== "test") {


  const server = http.createServer(app);


  const io = new Server(server, {

    path: "/socket.io",

    cors: {

      origin: allowedOrigins,

      credentials: true,

    },

    transports: ["websocket", "polling"],

  });


  app.set("io", io);



  /* ==================================================
     SOCKET AUTH FIXED VERSION
  ================================================== */

  /* ==================================================
   SOCKET AUTH — FINAL WORKING VERSION
================================================== */

io.use(async (socket, next) => {

  try {

    let token = null;


    /* =========================================
       1. FRONTEND auth.token (MOST IMPORTANT)
    ========================================= */

    if (socket.handshake.auth?.token) {

      token = socket.handshake.auth.token;

      console.log("🔑 Token from auth");

    }


    /* =========================================
       2. Authorization header fallback
    ========================================= */

    if (!token) {

      const authHeader =
        socket.handshake.headers.authorization;

      if (authHeader?.startsWith("Bearer ")) {

        token = authHeader.split(" ")[1];

        console.log("🔑 Token from header");

      }

    }


    /* =========================================
       3. Cookie fallback
    ========================================= */

    if (!token) {

      const cookies =
        socket.handshake.headers.cookie;

      if (cookies) {

        const tokenCookie =
          cookies
            .split(";")
            .map(c => c.trim())
            .find(c =>
              c.startsWith("token=")
            );

        if (tokenCookie) {

          token =
            tokenCookie.split("=")[1];

          console.log("🔑 Token from cookie");

        }

      }

    }


    /* =========================================
       FINAL VALIDATION
    ========================================= */

    if (!token) {

      console.log("❌ No socket token");

      return next(
        new Error("Unauthorized")
      );

    }


    const decoded = verify(token);


    const user =
      await prisma.user.findUnique({

        where: {
          id: decoded.sub
        }

      });


    if (!user) {

      console.log("❌ User not found");

      return next(
        new Error("Unauthorized")
      );

    }


    socket.user = {

      id: user.id,

      email: user.email,

      role: user.role,

    };


    console.log(
      "✅ Socket authenticated:",
      user.email
    );


    next();

  }

  catch (err) {

    console.error(
      "❌ Socket auth error:",
      err.message
    );

    next(
      new Error("Unauthorized")
    );

  }

});




  /* ==================================================
     SOCKET CONNECTION HANDLER
  ================================================== */

  io.on("connection", (socket) => {


    console.log("🔌 Socket connected:", socket.user.email);



    socket.on("join_application", async (applicationId) => {

      try {

        if (!applicationId) return;



        let application;



        if (socket.user.role === "MASTER_ADMIN") {

          application = await prisma.application.findFirst({

            where: {

              id: applicationId,

              deleted: false,

            },

          });

        }

        else {

          application = await prisma.application.findFirst({

            where: {

              id: applicationId,

              deleted: false,

              OR: [

                { userId: socket.user.id },

                {

                  members: {

                    some: {

                      userId: socket.user.id,

                    },

                  },

                },

              ],

            },

          });

        }



        if (!application) {

          console.log("❌ Access denied to app:", applicationId);

          return socket.emit("error", "Access denied");

        }



        const room = `app:${applicationId}`;


        socket.join(room);


        console.log("📡 Joined room:", room);


      }

      catch (err) {

        console.error("Join error:", err.message);

      }

    });



    socket.on("disconnect", () => {

      console.log("❌ Socket disconnected:", socket.user.email);

    });


  });



  /* ==================================================
     START SERVER
  ================================================== */

  const PORT = process.env.PORT || 3001;


  server.listen(PORT, "0.0.0.0", () => {

    console.log(`🚀 Server running on port ${PORT}`);

  });



  /* ==================================================
     GRACEFUL SHUTDOWN
  ================================================== */

  const shutdown = () => {

    console.log("🛑 Shutting down server...");


    server.close(() => {

      console.log("✅ Server closed");

      process.exit(0);

    });

  };


  process.on("SIGINT", shutdown);

  process.on("SIGTERM", shutdown);

}



module.exports = app;
