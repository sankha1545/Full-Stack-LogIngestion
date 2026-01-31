// backend/routes/logs.js

const express = require("express");
const router = express.Router();

const { z } = require("zod");
const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");

const LOG_FILE = path.join(__dirname, "../data/logs.ndjson");

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

router.post("/logs", async (req, res) => {
  const parsed = LogSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid log format" });
  }

  const log = parsed.data;

  try {
    await fs.ensureFile(LOG_FILE);
    await fs.appendFile(LOG_FILE, JSON.stringify(log) + "\n");

    // Emit to websocket clients
    const io = req.app.get("io");
    if (io) {
      io.emit("new_log", log);
    }

    return res.status(201).json(log);
  } catch (err) {
    console.error("POST /logs failed:", err);
    return res.status(500).json({ error: "Failed to save log" });
  }
});

/* ---------------- GET /api/logs ---------------- */

router.get("/logs", async (req, res) => {
  try {
    const parsedQuery = QuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const {
      level,
      search,
      resourceId,
      from,
      to,
      traceId,
      spanId,
      commit,
      caseSensitive,
    } = parsedQuery.data;

    // Defensive date validation
    if (from && to) {
      const fromTime = new Date(from).getTime();
      const toTime = new Date(to).getTime();
      if (!Number.isNaN(fromTime) && !Number.isNaN(toTime) && fromTime > toTime) {
        return res
          .status(400)
          .json({ error: "From date should not be greater than To date" });
      }
    }

    if (!(await fs.pathExists(LOG_FILE))) {
      return res.json([]);
    }

    const startTime = from ? new Date(from).getTime() : null;
    const endTime = to ? new Date(to).getTime() : Date.now();

    const results = [];
    const stream = fs.createReadStream(LOG_FILE);
    const rl = readline.createInterface({ input: stream });

    for await (const line of rl) {
      if (!line.trim()) continue;

      let log;
      try {
        log = JSON.parse(line);
      } catch {
        continue;
      }

      // Filters
      if (level) {
        const levels = level.split(",").map((s) => s.trim());
        if (!levels.includes(log.level)) continue;
      }

      if (resourceId) {
        if (
          !String(log.resourceId || "")
            .toLowerCase()
            .includes(resourceId.toLowerCase())
        ) {
          continue;
        }
      }

      if (search) {
        const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = caseSensitive === "true" ? "" : "i";
        const regex = new RegExp(safe, flags);
        if (!regex.test(String(log.message || ""))) continue;
      }

      if (traceId && log.traceId !== traceId) continue;
      if (spanId && log.spanId !== spanId) continue;
      if (commit && log.commit !== commit) continue;

      const t = new Date(log.timestamp).getTime();
      if (Number.isNaN(t)) continue;
      if (startTime && t < startTime) continue;
      if (endTime && t > endTime) continue;

      results.push(log);
    }

    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.json(results);
  } catch (err) {
    console.error("GET /logs failed:", err);
    return res.status(500).json({ error: "Failed to read logs" });
  }
});

module.exports = router;
