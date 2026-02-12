import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";

/* --------------------------------------------------
   Constants
-------------------------------------------------- */

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

export default function Analytics() {
  const { logs } = useLogs({});
  const [mode, setMode] = useState("daily");
  const [dailyRange, setDailyRange] = useState(7);

  /* --------------------------------------------------
     TIME SERIES (daily / monthly / yearly)
  -------------------------------------------------- */
  const timeSeries = useMemo(() => {
    if (!logs.length) return [];

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

    logs.forEach((log) => {
      const d = new Date(log.timestamp);
      if (d < start) return;

      let key;
      if (mode === "daily") key = d.toISOString().slice(0, 10);
      else if (mode === "monthly") key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      else key = d.getFullYear().toString();

      map.set(key, (map.get(key) || 0) + 1);
    });

    return [...map.entries()].map(([time, count]) => ({ time, count }));
  }, [logs, mode, dailyRange]);

  /* --------------------------------------------------
     BY LEVEL
  -------------------------------------------------- */
  const byLevel = useMemo(() => {
    const levels = { error: 0, warn: 0, info: 0, debug: 0 };
    logs.forEach((l) => {
      if (levels[l.level] !== undefined) levels[l.level]++;
    });
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const totalLogs = logs.length;
  const errorCount = byLevel.find((l) => l.name === "error")?.value || 0;
  const warnCount = byLevel.find((l) => l.name === "warn")?.value || 0;

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div className="mx-auto max-w-[1400px] space-y-10 p-6">
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Deep insights into system log behavior over time
        </p>
      </header>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <KpiCard label="Total Logs" value={totalLogs} />
        <KpiCard label="Errors" value={errorCount} color="text-red-600" />
        <KpiCard label="Warnings" value={warnCount} color="text-amber-600" />
      </section>

      {/* TIME SERIES */}
      <Card className="border">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
            <EmptyState text="No logs available for this range" />
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* BAR + PIE */}
      <section className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logs by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byLevel}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byLevel.map((e) => (
                    <Cell key={e.name} fill={LEVEL_COLORS[e.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byLevel}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {byLevel.map((e) => (
                    <Cell key={e.name} fill={LEVEL_COLORS[e.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/* --------------------------------------------------
   Small Components
-------------------------------------------------- */

function KpiCard({ label, value, color = "text-slate-900" }) {
  return (
    <Card className="transition hover:shadow-md">
      <CardContent className="pt-6">
        <div className="text-sm text-slate-500">{label}</div>
        <div className={`mt-1 text-3xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-24 text-sm text-center text-slate-500">
      {text}
    </div>
  );
}
