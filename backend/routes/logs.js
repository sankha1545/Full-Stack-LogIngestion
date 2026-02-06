const express = require("express");
const router = express.Router();
const { z } = require("zod");

const { createLog, queryLogs } = require("../services/log.service");

/* ---------------- SCHEMAS ---------------- */

const LogSchema = z.object({
  level: z.enum(["error", "warn", "info", "debug"]),
  message: z.string().min(1),
  resourceId: z.string().min(1),
  timestamp: z.string().datetime(),
  traceId: z.string().min(1),
  spanId: z.string().min(1),
  commit: z.string().min(1),
  metadata: z.record(z.any()),
});

const QuerySchema = z.object({
  level: z.string().optional(),
  search: z.string().optional(),
  resourceId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  commit: z.string().optional(),
  caseSensitive: z.enum(["true", "false"]).optional(),
});

/* ---------------- POST /api/logs ---------------- */

router.post("/", async (req, res) => {
  const parsed = LogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid log format" });
  }

  try {
    const log = await createLog(parsed.data);

    // WebSocket broadcast
    const io = req.app.get("io");
    if (io) io.emit("new_log", log);

    return res.status(201).json(log);
  } catch (err) {
    console.error("POST /logs failed:", err);
    return res.status(500).json({ error: "Failed to save log" });
  }
});

/* ---------------- GET /api/logs ---------------- */

router.get("/", async (req, res) => {
  const parsedQuery = QuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const { from, to } = parsedQuery.data;

  if (from && to && new Date(from) > new Date(to)) {
    return res
      .status(400)
      .json({ error: "From date should not be greater than To date" });
  }

  try {
    const logs = await queryLogs(parsedQuery.data);
    return res.json(logs);
  } catch (err) {
    console.error("GET /logs failed:", err);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;
