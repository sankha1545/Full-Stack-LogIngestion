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
 * Keeps styling minimal so it blends well with shadcn cards.
 */

export default function LogChart({ logs = [] }) {
  const counts = useMemo(
    () =>
      ["error", "warn", "info", "debug"].map((level) => ({
        level,
        count: logs.filter((l) => (l.level || "").toLowerCase() === level).length,
      })),
    [logs]
  );

  return (
    <div className="p-2">
      <h3 className="mb-2 text-sm text-slate-600">Logs by level</h3>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={counts}>
            <XAxis dataKey="level" tick={{ textTransform: "uppercase", fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
