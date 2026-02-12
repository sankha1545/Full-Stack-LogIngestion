import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { useLogs } from "../hooks/useLogs";

/* shadcn UI */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* -------------------------------------------------- */

const LEVEL_COLORS = {
  error: "#ef4444",
  warn: "#f59e0b",
  info: "#3b82f6",
  debug: "#64748b",
};

const DAILY_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "60D", days: 60 },
];

const MAX_LOGS = 10000;
const CHART_DEBOUNCE_MS = 250;

/* -------------------------------------------------- */

export default function Analytics() {
  // 🔥 IMPORTANT: NO {} here (fixes infinite refetch loop)
  const { logs } = useLogs();

  const [mode, setMode] = useState("daily");
  const [dailyRange, setDailyRange] = useState(7);

  const [snapshotLogs, setSnapshotLogs] = useState([]);
  const debounceRef = useRef(null);

  /* --------------------------------------------------
     Debounced snapshot for charts (performance)
  -------------------------------------------------- */

  useEffect(() => {
    const limited =
      Array.isArray(logs) && logs.length > MAX_LOGS
        ? logs.slice(-MAX_LOGS)
        : logs || [];

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      setSnapshotLogs(limited);
      debounceRef.current = null;
    }, CHART_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [logs]);

  /* --------------------------------------------------
     TIME SERIES
  -------------------------------------------------- */

  const timeSeries = useMemo(() => {
    if (!snapshotLogs.length) return [];

    const now = new Date();
    let start;

    if (mode === "daily") {
      start = new Date(now.getTime() - dailyRange * 86400000);
    } else if (mode === "monthly") {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      start = new Date(now.getFullYear() - 5, 0, 1);
    }

    const map = new Map();

    for (let i = 0; i < snapshotLogs.length; i++) {
      const log = snapshotLogs[i];
      const d = new Date(log.timestamp);

      if (Number.isNaN(d.getTime())) continue;
      if (d < start) continue;

      let key;
      if (mode === "daily") key = d.toISOString().slice(0, 10);
      else if (mode === "monthly") key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      else key = d.getFullYear().toString();

      map.set(key, (map.get(key) || 0) + 1);
    }

    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, count]) => ({ time, count }));
  }, [snapshotLogs, mode, dailyRange]);

  /* --------------------------------------------------
     BY LEVEL
  -------------------------------------------------- */

  const byLevel = useMemo(() => {
    const levels = { error: 0, warn: 0, info: 0, debug: 0 };

    for (let i = 0; i < snapshotLogs.length; i++) {
      const l = snapshotLogs[i];
      if (l && levels[l.level] !== undefined) levels[l.level]++;
    }

    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [snapshotLogs]);

  const totalLogs = snapshotLogs.length;
  const errorCount = byLevel.find((l) => l.name === "error")?.value || 0;
  const warnCount = byLevel.find((l) => l.name === "warn")?.value || 0;

  /* -------------------------------------------------- */

  return (
    <div className="mx-auto max-w-[1400px] space-y-10 p-6">
      <header>
        <h1 className="text-3xl font-extrabold">Analytics</h1>
        <p className="text-sm text-slate-500">
          Deep insights into system log behavior
        </p>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <KpiCard label="Total Logs" value={totalLogs} />
        <KpiCard label="Errors" value={errorCount} color="text-red-600" />
        <KpiCard label="Warnings" value={warnCount} color="text-amber-600" />
      </section>

      {/* TIME SERIES */}
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Logs Over Time</CardTitle>

            <Tabs value={mode} onValueChange={setMode}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {mode === "daily" && (
            <div className="flex gap-2">
              {DAILY_RANGES.map((r) => (
                <Button
                  key={r.days}
                  size="sm"
                  variant={dailyRange === r.days ? "default" : "outline"}
                  onClick={() => setDailyRange(r.days)}
                >
                  Last {r.label}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {timeSeries.length === 0 ? (
            <EmptyState text="No logs available" />
          ) : (
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BAR + PIE */}
      <section className="grid gap-8 lg:grid-cols-2">
        <ChartCard title="Logs by Severity">
          <BarChart data={byLevel}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" isAnimationActive={false}>
              {byLevel.map((e) => (
                <Cell key={e.name} fill={LEVEL_COLORS[e.name]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Severity Distribution">
          <PieChart>
            <Pie data={byLevel} dataKey="value" nameKey="name" outerRadius={100}>
              {byLevel.map((e) => (
                <Cell key={e.name} fill={LEVEL_COLORS[e.name]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>
      </section>
    </div>
  );
}

/* -------------------------------------------------- */

const KpiCard = React.memo(({ label, value, color = "text-slate-900" }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </CardContent>
  </Card>
));

function ChartCard({ title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }) {
  return <div className="py-24 text-center text-slate-500">{text}</div>;
}
