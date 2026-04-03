import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
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
  AreaChart,
  Area,
} from "recharts";
import { Activity, AlertTriangle, AppWindow, BarChart3, Sparkles } from "lucide-react";

import { getApps } from "@/api/appsApi";
import { useLogs } from "@/hooks/useLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classifyLogKind } from "@/utils/logs";

const LEVEL_COLORS = {
  ERROR: "#ef4444",
  FATAL: "#be123c",
  WARN: "#f59e0b",
  INFO: "#0ea5e9",
  DEBUG: "#64748b",
};

const DAILY_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "60D", days: 60 },
];

export default function Analytics() {
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [mode, setMode] = useState("daily");
  const [dailyRange, setDailyRange] = useState(7);

  useEffect(() => {
    async function loadApps() {
      try {
        const res = await getApps();
        const allApps = res?.data || [];
        setApps(allApps);
        if (allApps.length > 0 && !selectedAppId) {
          setSelectedAppId(allApps[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadApps();
  }, [selectedAppId]);

  const { logs, loading } = useLogs(selectedAppId ? { applicationId: selectedAppId } : {}, {
    page: 1,
    limit: 200,
  });

  const selectedApp = apps.find((app) => app.id === selectedAppId);

  const timeSeries = React.useMemo(() => {
    if (!logs.length) return [];

    const now = new Date();
    const start =
      mode === "daily"
        ? new Date(now.getTime() - dailyRange * 24 * 60 * 60 * 1000)
        : mode === "monthly"
          ? new Date(now.getFullYear(), 0, 1)
          : new Date(now.getFullYear() - 5, 0, 1);

    const groups = new Map();

    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      if (Number.isNaN(date.getTime()) || date < start) return;

      const key =
        mode === "daily"
          ? date.toISOString().slice(0, 10)
          : mode === "monthly"
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            : `${date.getFullYear()}`;

      groups.set(key, (groups.get(key) || 0) + 1);
    });

    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, count]) => ({ time, count }));
  }, [dailyRange, logs, mode]);

  const byLevel = React.useMemo(() => {
    const counts = { FATAL: 0, ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
    logs.forEach((log) => {
      const key = String(log.level || "INFO").toUpperCase();
      if (counts[key] !== undefined) {
        counts[key] += 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const byKind = React.useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      const kind = classifyLogKind(log);
      map[kind] = (map[kind] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [logs]);

  const totalLogs = logs.length;
  const errorCount = byLevel.find((entry) => entry.name === "ERROR")?.value || 0;
  const fatalCount = byLevel.find((entry) => entry.name === "FATAL")?.value || 0;
  const warnCount = byLevel.find((entry) => entry.name === "WARN")?.value || 0;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white shadow-[0_28px_80px_rgba(37,99,235,0.22)]">
        <div className="grid gap-6 p-8 lg:grid-cols-[1.4fr_1fr] lg:p-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              Animated analytics
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cleaner graphs, better hierarchy, and application-specific insight.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-50/90 sm:text-base">
                The analytics screen now uses a more standard dashboard structure with a clear app selector, stronger KPI cards,
                and animated visualizations that help users understand volume, severity, and event patterns faster.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Application</label>
            <select
              className="mt-3 h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none"
              value={selectedAppId}
              onChange={(event) => setSelectedAppId(event.target.value)}
            >
              {apps.length === 0 && <option value="">No applications available</option>}
              {apps.map((app) => (
                <option key={app.id} value={app.id} className="text-slate-900">
                  {app.name}
                </option>
              ))}
            </select>
            <div className="mt-4 text-sm text-blue-100/90">
              {selectedApp ? `${selectedApp.name} • ${selectedApp.environment}` : "Select an application to load analytics."}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total logs" value={totalLogs} icon={AppWindow} color="bg-sky-50 text-sky-700" />
        <KpiCard label="Errors" value={errorCount + fatalCount} icon={AlertTriangle} color="bg-rose-50 text-rose-700" />
        <KpiCard label="Warnings" value={warnCount} icon={Activity} color="bg-amber-50 text-amber-700" />
        <KpiCard label="Event types" value={byKind.length} icon={BarChart3} color="bg-indigo-50 text-indigo-700" />
      </section>

      <Card className="rounded-[28px] border-slate-200 shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Log volume over time</CardTitle>
            <p className="text-sm text-slate-500">Animated trend lines make growth and spikes easier to read.</p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="rounded-2xl bg-slate-100 p-1">
                <TabsTrigger value="daily" className="rounded-xl">Daily</TabsTrigger>
                <TabsTrigger value="monthly" className="rounded-xl">Monthly</TabsTrigger>
                <TabsTrigger value="yearly" className="rounded-xl">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === "daily" && (
              <div className="flex flex-wrap gap-2">
                {DAILY_RANGES.map((range) => (
                  <Button
                    key={range.days}
                    size="sm"
                    variant={dailyRange === range.days ? "default" : "outline"}
                    className="rounded-xl"
                    onClick={() => setDailyRange(range.days)}
                  >
                    Last {range.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <EmptyState text="Loading analytics..." />
          ) : timeSeries.length === 0 ? (
            <EmptyState text="No logs available for the selected application." />
          ) : (
            <div className="h-[360px] w-full">
              <ResponsiveContainer>
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#volumeGradient)"
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Severity breakdown" subtitle="Animated bars help compare volume per level quickly.">
          <BarChart data={byLevel}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[12, 12, 4, 4]} animationDuration={700}>
              {byLevel.map((entry) => (
                <Cell key={entry.name} fill={LEVEL_COLORS[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Severity distribution" subtitle="Pie animation gives a quick proportional summary.">
          <PieChart>
            <Pie
              data={byLevel}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={96}
              paddingAngle={3}
              animationDuration={850}
            >
              {byLevel.map((entry) => (
                <Cell key={entry.name} fill={LEVEL_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Top event types" subtitle="Derived from structured metadata and log content.">
          <LineChart data={byKind}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ r: 4, fill: "#7c3aed" }}
              activeDot={{ r: 6 }}
              animationDuration={900}
            />
          </LineChart>
        </ChartCard>
      </section>
    </div>
  );
}

const KpiCard = React.memo(function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <Card className="rounded-[24px] border-slate-200 shadow-sm">
      <CardContent className="pt-6">
        <div className={`inline-flex rounded-2xl p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-4 text-sm text-slate-500">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-slate-950">{value}</div>
      </CardContent>
    </Card>
  );
});

function ChartCard({ title, subtitle, children }) {
  return (
    <Card className="rounded-[28px] border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }) {
  return <div className="py-24 text-center text-slate-500">{text}</div>;
}
