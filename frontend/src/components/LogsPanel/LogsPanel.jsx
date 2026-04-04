import { useState } from "react";

import LogItem from "../LogItem/LogItem";
import LiveLogs from "../logs/LiveLogs";

export default function LogsPanel({ logs = [], loading = false, applicationId }) {
  const [mode, setMode] = useState("history");

  if (loading && mode === "history") {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="rounded-xl bg-[#0f172a] shadow">
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setMode("history")}
          className={`px-4 py-2 text-sm ${
            mode === "history" ? "border-b-2 border-blue-500 text-white" : "text-gray-400"
          }`}
        >
          Logs
        </button>

        <button
          onClick={() => setMode("live")}
          className={`px-4 py-2 text-sm ${
            mode === "live" ? "border-b-2 border-green-500 text-white" : "text-gray-400"
          }`}
        >
          Live Tail
        </button>
      </div>

      <div className="p-4">
        {mode === "history" && (
          <div className="space-y-1">
            {logs.length === 0 && <p className="text-gray-400">No logs found</p>}

            {logs.map((log, index) => (
              <LogItem key={log.id || index} log={log} />
            ))}
          </div>
        )}

        {mode === "live" && <LiveLogs applicationId={applicationId} />}
      </div>
    </div>
  );
}
