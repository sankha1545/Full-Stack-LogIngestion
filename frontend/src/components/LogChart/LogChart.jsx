// src/components/LogChart/LogChart.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Lightweight bar chart of counts by level.
 * Defensive: avoids rendering Recharts when counts are zero
 * or when layout may be unstable (uses explicit height).
 */

export default function LogChart({ logs = [] }) {
  const counts = useMemo(() => {
    const levels = ["error", "warn", "info", "debug"];
    return levels.map((level) => ({
      level,
      count: logs.filter((l) => (l.level || "").toLowerCase() === level).length,
    }));
  }, [logs]);

  const total = counts.reduce((s, c) => s + (Number(c.count) || 0), 0);

  return (
    <div className="p-2">
      <h3 className="mb-2 text-sm text-slate-600">Logs by level</h3>

      {/* Defensive container: explicit fixed pixel height avoids parent measurement edge-cases */}
      <div style={{ width: "100%", height: 200, minWidth: 0 }}>
        {total === 0 ? (
          // Simple placeholder — avoids mounting Recharts when there's nothing to show
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="text-sm text-slate-500">No logs yet</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={counts}>
              <XAxis
                dataKey="level"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => v.toUpperCase()}
                height={30}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
