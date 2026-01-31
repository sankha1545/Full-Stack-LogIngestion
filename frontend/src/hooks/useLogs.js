import { useEffect, useState, useRef, useMemo } from "react";
import { fetchLogs } from "../api/logsApi";
import { getSocket } from "../services/socket";

/* ---------- Pure Filter Matcher ---------- */
function matchesFilters(log, filters = {}) {
  const logTime = new Date(log.timestamp).getTime();
  if (Number.isNaN(logTime)) return false;

  // Level filter
  if (filters.level && filters.level !== "" && log.level !== filters.level) {
    return false;
  }

  // Resource filter
  if (filters.resourceId && filters.resourceId !== "") {
    const r = String(filters.resourceId).toLowerCase();
    if (!String(log.resourceId || "").toLowerCase().includes(r)) {
      return false;
    }
  }

  // Message search
  if (filters.search && filters.search !== "") {
    const pattern = String(filters.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = filters.caseSensitive ? "" : "i";
    const re = new RegExp(pattern, flags);
    if (!re.test(String(log.message || ""))) {
      return false;
    }
  }

  // Time range
  if (filters.from) {
    const fromTime = new Date(filters.from).getTime();
    if (!Number.isNaN(fromTime) && logTime < fromTime) return false;
  }

  if (filters.to) {
    const toTime = new Date(filters.to).getTime();
    if (!Number.isNaN(toTime) && logTime > toTime) return false;
  }

  return true;
}

/* ---------- Defensive Validation ---------- */
function validateFilters(filters = {}) {
  if (filters.from && filters.to) {
    const from = new Date(filters.from).getTime();
    const to = new Date(filters.to).getTime();

    if (!Number.isNaN(from) && !Number.isNaN(to) && from > to) {
      return {
        valid: false,
        error: "From date should not be greater than To date",
      };
    }
  }

  return { valid: true, error: null };
}

/* ---------- Main Hook ---------- */
export function useLogs(filters = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Used to prevent duplicates
  const prevIds = useRef(new Set());

  /* -------- REST SNAPSHOT (only on filter change) -------- */
  useEffect(() => {
    const controller = new AbortController();
    const validation = validateFilters(filters);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setLoading(true);

    fetchLogs(filters, controller.signal)
      .then((data) => {
        const sorted = (data || []).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Track existing IDs
        prevIds.current = new Set(
          sorted.map((l) => `${l.timestamp}-${l.traceId}-${l.spanId}`)
        );

        setLogs(sorted);
      })
      .catch(() => {
        setError("Failed to fetch logs from server");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [JSON.stringify(filters)]);

  /* -------- SOCKET STREAM (ONLY ONCE) -------- */
  useEffect(() => {
    const socket = getSocket(); // 🔥 THIS WAS THE MISSING LINE

    const handler = (newLog) => {
      const key = `${newLog.timestamp}-${newLog.traceId}-${newLog.spanId}`;

      // Skip duplicates
      if (prevIds.current.has(key)) return;

      prevIds.current.add(key);
      setLogs((prev) => [newLog, ...prev]);
    };

    socket.on("new_log", handler);

    return () => {
      socket.off("new_log", handler);
    };
  }, []);

  /* -------- FILTERED VIEW -------- */
  const visibleLogs = useMemo(() => {
    return logs.filter((l) => matchesFilters(l, filters));
  }, [logs, filters]);

  return {
    logs: visibleLogs,
    loading,
    error,
  };
}
