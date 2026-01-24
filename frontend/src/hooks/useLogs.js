import { useEffect, useState, useRef, useMemo } from "react";
import { fetchLogs } from "../api/logsApi";
import { socket } from "../services/socket";

function matchesFilters(log, filters = {}) {
  // Ensure timestamps parsed as numbers
  const logTime = new Date(log.timestamp).getTime();
  if (Number.isNaN(logTime)) return false;

  // Level filter (exact)
  if (filters.level && filters.level !== "" && log.level !== filters.level) return false;

  // ResourceId (case-insensitive substring)
  if (filters.resourceId && filters.resourceId !== "") {
    const r = String(filters.resourceId).toLowerCase();
    if (!String(log.resourceId || "").toLowerCase().includes(r)) return false;
  }

  // Message search: respect caseSensitive flag
  if (filters.search && filters.search !== "") {
    const pattern = String(filters.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = filters.caseSensitive ? "" : "i";
    const re = new RegExp(pattern, flags);
    if (!re.test(String(log.message || ""))) return false;
  }

  // Time range: filters.from and filters.to are expected as ISO strings
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

export function useLogs(filters = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevIds = useRef(new Set());

  // stable key for debounce/effects
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  /* -------- REST FETCH (debounced) -------- */
  useEffect(() => {
    const controller = new AbortController();

    const debounce = setTimeout(() => {
      setLoading(true);
      fetchLogs(filters, controller.signal)
        .then((data) => {
          // ensure server-side returned items also pass local filters (safety)
          const filtered = (data || []).filter((l) => matchesFilters(l, filters));
          // sort newest first
          const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          prevIds.current = new Set(sorted.map((l) => `${l.timestamp}-${l.traceId}-${l.spanId}`));
          setLogs(sorted);
        })
        .catch((err) => {
          console.error("fetchLogs failed:", err);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [filterKey]);

  /* -------- REAL-TIME SOCKET -------- */
  useEffect(() => {
    const handler = (newLog) => {
      const key = `${newLog.timestamp}-${newLog.traceId}-${newLog.spanId}`;
      if (prevIds.current.has(key)) return;
      if (!matchesFilters(newLog, filters)) return;

      prevIds.current.add(key);
      setLogs((prev) => [newLog, ...prev]);
    };

    socket.on("new_log", handler);
    return () => socket.off("new_log", handler);
  }, [filterKey]);

  return { logs, loading };
}
