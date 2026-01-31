const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.disable("etag");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// ---- ROUTES (NAMESPACED) ----
const logsRouter = require("./routes/logs");
app.use("/api", logsRouter);   // <<<<< THIS IS THE FIX

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

let server;
let io;

if (process.env.NODE_ENV !== "test") {
  server = http.createServer(app);

  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
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
