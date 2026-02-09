const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
require("dotenv").config();

/* --------------------------------------------------
   Passport strategies (Google / GitHub)
-------------------------------------------------- */
require("./auth/passport");

const app = express();
app.disable("etag");

/* --------------------------------------------------
   SECURITY MIDDLEWARE
-------------------------------------------------- */

// Helmet: security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Request logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json());

// Cookies
app.use(cookieParser());

// Passport (OAuth, stateless)
app.use(passport.initialize());

// CORS (Vite)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

/* --------------------------------------------------
   ROUTES
-------------------------------------------------- */

// Core routes
const logsRouter = require("./routes/logs");
const contactRouter = require("./routes/contact");
const geoRouter = require("./routes/geo");

// Auth routes
const authRouter = require("./routes/auth");     // email + password
const oauthRouter = require("./routes/oauth");   // Google / GitHub

// Mount routes
app.use("/api", logsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/geo", geoRouter);
app.use("/api/auth", authRouter);
app.use("/api/auth", oauthRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* --------------------------------------------------
   SOCKET.IO
-------------------------------------------------- */

let server;
let io;

if (process.env.NODE_ENV !== "test") {
  server = http.createServer(app);

  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 API + WebSocket running on port ${PORT}`);
  });
}

module.exports = app;
