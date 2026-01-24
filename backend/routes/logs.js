const { z } = require("zod");
const fs = require("fs-extra");
const path = require("path");
const lockfile = require("proper-lockfile");

const LOG_FILE = path.join(__dirname, "../data/logs.json");

/* ----------- SCHEMA ----------- */
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

/* ----------- POST /logs ----------- */
async function postLogs(req, res) {
  const parsed = LogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const log = parsed.data;
  let release;

  try {
    if (!(await fs.pathExists(LOG_FILE))) {
      await fs.outputFile(LOG_FILE, "[]");
    }

    release = await lockfile.lock(LOG_FILE, { retries: 5 });

    const raw = await fs.readFile(LOG_FILE, "utf-8");
    const logs = raw ? JSON.parse(raw) : [];

    logs.push(log);

    const temp = LOG_FILE + ".tmp";
    await fs.writeFile(temp, JSON.stringify(logs, null, 2));
    await fs.rename(temp, LOG_FILE);

    await release();

    if (req.io) req.io.emit("new_log", log);

    return res.status(201).json(log);
  } catch (err) {
    if (release) await release();
    console.error("Write failed:", err);
    return res.status(500).json({ error: "Failed to save log" });
  }
}

/* ----------- GET /logs ----------- */
async function getLogs(req, res) {
  try {
    if (!(await fs.pathExists(LOG_FILE))) {
      return res.json([]);
    }

    const raw = await fs.readFile(LOG_FILE, "utf-8");
    const logs = raw ? JSON.parse(raw) : [];

    let results = logs;

    // Accept both sets of names: frontend uses 'search', 'from', 'to'
    const {
      level,
      message,
      search,
      resourceId,
      from,
      to,
      timestamp_start,
      timestamp_end,
      traceId,
      spanId,
      commit,
      caseSensitive,
    } = req.query;

    const msgFilter = search || message;
    const start = from || timestamp_start;
    const end = to || timestamp_end;

    // Level filter (allow comma-separated multiple levels)
    if (level) {
      const levels = String(level).split(",").map((s) => s.trim());
      results = results.filter((l) => levels.includes(l.level));
    }

    // resourceId filter (case-insensitive substring match)
    if (resourceId) {
      const r = String(resourceId).toLowerCase();
      results = results.filter((l) =>
        (l.resourceId || "").toLowerCase().includes(r)
      );
    }

    // message search: respect caseSensitive flag
    if (msgFilter) {
      // escape regex special chars
      const safe = String(msgFilter).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const flags = caseSensitive && (caseSensitive === "1" || caseSensitive === "true") ? "" : "i";
      const regex = new RegExp(safe, flags);
      results = results.filter((l) => regex.test(String(l.message || "")));
    }

    if (traceId) results = results.filter((l) => l.traceId === traceId);
    if (spanId) results = results.filter((l) => l.spanId === spanId);
    if (commit) results = results.filter((l) => l.commit === commit);

    // time range: parse start/end as Date; support ISO or local-ISO converted by frontend
    if (start || end) {
      const startTime = start ? new Date(start).getTime() : null;
      const endTime = end ? new Date(end).getTime() : null;

      results = results.filter((l) => {
        const t = new Date(l.timestamp).getTime();
        if (Number.isNaN(t)) return false; // invalid timestamp in log -> skip
        if (startTime && t < startTime) return false;
        if (endTime && t > endTime) return false;
        return true;
      });
    }

    // newest first
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json(results);
  } catch (err) {
    console.error("Read failed:", err);
    return res.status(500).json({ error: "Failed to read logs" });
  }
}

module.exports = { postLogs, getLogs };
