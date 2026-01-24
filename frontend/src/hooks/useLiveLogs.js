import { useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";

export function useLiveLogs() {
  const [logs, setLogs] = useState([]);
  const seen = useRef(new Set());

  useEffect(() => {
    const handler = (log) => {
      const key = log.timestamp + log.traceId;
      if (seen.current.has(key)) return;

      seen.current.add(key);
      setLogs((prev) => [log, ...prev].slice(0, 200));
    };

    socket.on("new_log", handler);
    return () => socket.off("new_log", handler);
  }, []);

  return logs;
}
