const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.disable("etag");

const server = http.createServer(app);
const { postLogs, getLogs } = require("./routes/logs");

// ------------------ SOCKET.IO ------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

app.post("/logs", postLogs);
app.get("/logs", getLogs);

// ------------------ SOCKET CONNECTION ------------------
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
});

// ------------------ ONLY LISTEN IF NOT TESTING ------------------
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`🚀 API + WebSocket running on port ${PORT}`);
  });
}

module.exports = server;
