import { useEffect, useState, useRef, useMemo } from "react";
import { fetchLogs } from "../api/logsApi";
import { getSocket } from "../services/socket";

/* =====================================================
   Defensive Validation
===================================================== */

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

/* =====================================================
   Main Hook
===================================================== */

export function useLogs(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 50,
  } = options;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const prevIds = useRef(new Set());

  const applicationId = filters.applicationId;

  /* -------------------------------------------------
     REST FETCH (server-side filtering + pagination)
  ------------------------------------------------- */

  useEffect(() => {
    const controller = new AbortController();
    const validation = validateFilters(filters);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setLoading(true);

    fetchLogs({ ...filters, page, limit }, controller.signal)
      .then((response) => {
        const data = response?.data || response || [];

        prevIds.current = new Set(data.map((l) => l.id));

        setLogs(data);
      })
      .catch(() => {
        setError("Failed to fetch logs from server");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filters, page, limit]);

  /* -------------------------------------------------
     SOCKET STREAM (per-application room)
  ------------------------------------------------- */

  useEffect(() => {
    if (!applicationId) return;

    const socket = getSocket();

    // 🔥 Join correct application room
    socket.emit("join_application", applicationId);

    const handler = (newLog) => {
      if (!newLog || newLog.applicationId !== applicationId) return;

      if (prevIds.current.has(newLog.id)) return;

      prevIds.current.add(newLog.id);

      setLogs((prev) => [newLog, ...prev]);
    };

    socket.on("new_log", handler);

    return () => {
      socket.off("new_log", handler);
    };
  }, [applicationId]);

  /* -------------------------------------------------
     Memoized Return (no client-side heavy filtering)
  ------------------------------------------------- */

  const visibleLogs = useMemo(() => logs, [logs]);

  return {
    logs: visibleLogs,
    loading,
    error,
  };
}
