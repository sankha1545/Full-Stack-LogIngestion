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
const savedViewsRouter =
require("./routes/savedViews");
const analyticsJob =
  require("./jobs/analytics.job");

const prisma =
  require("./utils/prisma");

const { verify } =
  require("./utils/jwt");

const searchRouter =
require("./routes/search");
/* ==================================================
   PASSPORT CONFIG
================================================== */
const alertRouter =
require("./routes/alerts");

require("./auth/passport");


/* ==================================================
   EXPRESS INIT
================================================== */

const app = express();

app.disable("etag");
app.use(
"/api/saved-views",
savedViewsRouter
);

/* ==================================================
   SECURITY MIDDLEWARE
================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
"/api/alerts",
alertRouter
);

app.use(morgan("dev"));

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(cookieParser());

app.use(passport.initialize());

app.use(
"/api/search",
searchRouter
);
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

      if (!origin ||
        allowedOrigins.includes(origin)) {

        return callback(null, true);

      }

      console.warn(
        "Blocked CORS:",
        origin
      );

      return callback(
        new Error("Not allowed by CORS")
      );

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



/* Higher limit for ingestion */

const ingestLimiter = rateLimit({

  windowMs: 60 * 1000,

  max: 200,

});


app.use(
  "/api/logs/ingest",
  ingestLimiter
);


/* ==================================================
   ROUTES
================================================== */

const logsRouter =
  require("./routes/logs");

const logStatsRouter =
  require("./routes/logStats");

const contactRouter =
  require("./routes/contact");

const geoRouter =
  require("./routes/geo");

const authRouter =
  require("./routes/auth");

const oauthRouter =
  require("./routes/oauth");

const profileRouter =
  require("./routes/profile");

const appsRouter =
  require("./routes/apps");

const adminRouter =
  require("./routes/admin");


/* Auth */

app.use("/api/auth", authRouter);

app.use("/api/auth", oauthRouter);


/* Profile */

app.use("/api/profile", profileRouter);


/* Applications */

app.use("/api/apps", appsRouter);


/* Logs */

app.use("/api/logs", logsRouter);


/* ⭐ NEW — Stats Route */

app.use("/api/logs", logStatsRouter);


/* Other */

app.use("/api/contact", contactRouter);

app.use("/api/geo", geoRouter);

app.use("/api/admin", adminRouter);



/* ==================================================
   HEALTH CHECK
================================================== */

app.get("/health", async (_, res) => {

  const dbHealthy =
    await prisma.healthCheck();

  res.status(200).json({

    status: "ok",

    database:
      dbHealthy
        ? "connected"
        : "disconnected",

    uptime: process.uptime(),

    timestamp:
      new Date().toISOString(),

  });

});



/* ==================================================
   SOCKET.IO SERVER
================================================== */

if (process.env.NODE_ENV !== "test") {

  const server =
    http.createServer(app);


  const io =
    new Server(server, {

      path: "/socket.io",

      cors: {

        origin: allowedOrigins,

        credentials: true,

      },

      transports:
        ["websocket", "polling"],

    });
global.io = io;

  app.set("io", io);



  /* ==================================================
     SOCKET AUTH
  ================================================== */

  io.use(async (socket, next) => {

    try {

      let token = null;


      if (
        socket.handshake.auth?.token
      ) {

        token =
          socket.handshake.auth.token;

      }


      if (!token) {

        const header =
          socket.handshake.headers.authorization;

        if (
          header?.startsWith("Bearer ")
        ) {

          token =
            header.split(" ")[1];

        }

      }


      if (!token) {

        const cookies =
          socket.handshake.headers.cookie;

        if (cookies) {

          const found =
            cookies
              .split(";")
              .map(c => c.trim())
              .find(c =>
                c.startsWith("token=")
              );

          if (found)
            token =
              found.split("=")[1];

        }

      }


      if (!token)
        return next(
          new Error("Unauthorized")
        );


      const decoded =
        verify(token);


      const user =
        await prisma.user.findUnique({

          where: {

            id: decoded.sub,

          },

        });


      if (!user)
        return next(
          new Error("Unauthorized")
        );


      socket.user = {

        id: user.id,

        email: user.email,

        role: user.role,

      };


      next();

    }

    catch {

      next(
        new Error("Unauthorized")
      );

    }

  });



  /* ==================================================
     SOCKET CONNECTION
  ================================================== */

  io.on("connection", socket => {

    console.log(
      "Socket connected:",
      socket.user.email
    );


    socket.on(
      "join_application",
      async applicationId => {

        try {

          if (!applicationId)
            return;


          let application;


          if (
            socket.user.role ===
            "MASTER_ADMIN"
          ) {

            application =
              await prisma.application.findFirst({

                where: {

                  id: applicationId,

                  deleted: false,

                },

              });

          }

          else {

            application =
              await prisma.application.findFirst({

                where: {

                  id: applicationId,

                  deleted: false,

                  OR: [

                    {
                      userId:
                        socket.user.id,
                    },

                    {

                      members: {

                        some: {

                          userId:
                            socket.user.id,

                        },

                      },

                    },

                  ],

                },

              });

          }


          if (!application)
            return socket.emit(
              "error",
              "Access denied"
            );


          socket.join(
            `app:${applicationId}`
          );


        }

        catch (err) {

          console.error(
            "Join error:",
            err.message
          );

        }

      }
    );


    socket.on(
      "disconnect",
      () => {

        console.log(
          "Socket disconnected:",
          socket.user.email
        );

      }
    );

  });



  /* ==================================================
     START SERVER
  ================================================== */

  const PORT =
    process.env.PORT || 3001;


  server.listen(

    PORT,

    "0.0.0.0",

    () => {

      console.log(
        `🚀 Server running on ${PORT}`
      );


      ///////////////////////////////////////////////////
      // START ANALYTICS JOB
      ///////////////////////////////////////////////////

      analyticsJob.startAnalyticsJob();


    }

  );



  /* ==================================================
     GRACEFUL SHUTDOWN
  ================================================== */

  const shutdown = async () => {

    console.log(
      "Shutting down..."
    );


    await prisma.$disconnect();


    server.close(() => {

      console.log(
        "Server closed"
      );

      process.exit(0);

    });

  };


  process.on(
    "SIGINT",
    shutdown
  );

  process.on(
    "SIGTERM",
    shutdown
  );

}


/* ==================================================
   EXPORT
================================================== */

module.exports = app;