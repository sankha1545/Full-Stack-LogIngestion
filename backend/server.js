const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { postLogs, getLogs } = require("./routes/logs");

const app = express();
const server = http.createServer(app);
const { execCommand } = require("./routes/cli");

app.post("/cli/exec", execCommand);

// ------------------ SOCKET.IO ------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// attach io to req so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ------------------ MIDDLEWARE ------------------
app.use(cors());
app.use(express.json());

// ------------------ ROUTES ------------------
app.post("/logs", postLogs);
app.get("/logs", getLogs);

// ------------------ SOCKET CONNECTION ------------------
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ------------------ SERVER ------------------
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 API + WebSocket running on http://localhost:${PORT}`);
});
