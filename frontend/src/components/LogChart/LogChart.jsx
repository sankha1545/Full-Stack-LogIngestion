import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from "recharts";

const LEVELS = ["fatal", "error", "warn", "info", "debug"];
const LEVEL_COLORS = {
  fatal: "#be123c",
  error: "#ef4444",
  warn: "#f59e0b",
  info: "#0ea5e9",
  debug: "#64748b",
};

export default function LogChart({ logs = [] }) {
  const distribution = useMemo(() => {
    return LEVELS.map((level) => ({
      level,
      count: logs.filter((log) => String(log.level || "").toLowerCase() === level).length,
    }));
  }, [logs]);

  const timeSeries = useMemo(() => {
    const map = {};

    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      if (Number.isNaN(date.getTime())) return;
      const key = `${String(date.getHours()).padStart(2, "0")}:00`;
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [logs]);

  const total = logs.length;

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Volume trend</h3>
          <p className="mt-1 text-sm text-slate-500">Animated line chart for log flow through the day.</p>
        </div>

        <div className="h-[260px] w-full rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          {total === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">No data</div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={timeSeries}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#2563eb" }}
                  activeDot={{ r: 5 }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Severity mix</h3>
          <p className="mt-1 text-sm text-slate-500">Animated bars with clearer color coding for each level.</p>
        </div>

        <div className="h-[260px] w-full rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          {total === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">No logs</div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={distribution}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="level" tickFormatter={(value) => value.toUpperCase()} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[12, 12, 4, 4]} animationDuration={700}>
                  {distribution.map((entry) => (
                    <Cell key={entry.level} fill={LEVEL_COLORS[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}

