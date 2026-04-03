import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Activity, ArrowDown, Braces, Clock3, Filter, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

import { useLogs } from "@/hooks/useLogs";
import FilterBar from "@/components/FilterBar/FilterBar";
import LogsList from "@/components/LogsList/LogsList";
import { classifyLogKind, formatLogTimestamp } from "@/utils/logs";

export default function AppDetail() {
  const { id } = useParams();
  const [filters, setFilters] = useState({
    search: undefined,
    resourceId: undefined,
    level: undefined,
    from: undefined,
    to: undefined,
    caseSensitive: false,
  });

  const finalFilters = useMemo(() => ({ applicationId: id, ...filters }), [filters, id]);
  const { logs = [], loading, error } = useLogs(finalFilters, { page: 1, limit: 100 });

  const overview = useMemo(() => {
    const errorCount = logs.filter((log) => ["ERROR", "FATAL"].includes(String(log.level).toUpperCase())).length;
    const services = new Set(logs.map((log) => log.service).filter(Boolean)).size;
    const lastSeen = logs[0]?.timestamp;
    const eventKinds = new Set(logs.map((log) => classifyLogKind(log))).size;

    return { errorCount, services, lastSeen, eventKinds };
  }, [logs]);

  const terminalLines = logs.slice(0, 6).map((log) => {
    const level = String(log.level || "INFO").toUpperCase();
    const service = log.service || "app";
    const message = log.message || "No message";
    return `[${formatLogTimestamp(log.timestamp)}] ${service} ${level} ${message}`;
  });

  if (!id) {
    return <div className="p-8 text-red-600">Invalid application ID</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_1fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              <TerminalSquare className="h-3.5 w-3.5" />
              Application console
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">A clearer live terminal and log investigation workspace.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              The application detail experience now puts the live terminal preview, filters, structured logs, and investigation context into a single more standard layout.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat icon={Activity} label="Live logs" value={logs.length} />
            <Stat icon={ArrowDown} label="Errors + fatals" value={overview.errorCount} />
            <Stat icon={Braces} label="Event types" value={overview.eventKinds} />
            <Stat icon={Clock3} label="Last seen" value={overview.lastSeen ? formatLogTimestamp(overview.lastSeen) : "Waiting"} compact />
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <TerminalSquare className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-semibold">Live terminal tail</h2>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                socket-backed stream
              </div>
            </div>

            <div className="space-y-2 p-4 font-mono text-sm text-slate-200">
              {terminalLines.length > 0 ? (
                terminalLines.map((line, index) => (
                  <motion.div
                    key={`${line}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2"
                  >
                    {line}
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-3 py-8 text-center text-slate-400">
                  No live terminal output yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <Filter className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <FilterBar filters={filters} setFilters={setFilters} />
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            {overview.services > 0
              ? `${overview.services} services are represented in the current result set.`
              : "Apply filters or wait for live data to narrow the stream."}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Structured logs</h2>
            <p className="mt-1 text-sm text-slate-500">Each log row is easier to scan, with better spacing, stronger hierarchy, and quick metadata context.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">Newest {logs.length} entries</div>
        </div>
        <LogsList logs={logs} loading={loading} />
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, compact = false }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="inline-flex rounded-2xl bg-white/10 p-2 text-sky-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-sm text-slate-300">{label}</div>
      <div className={`mt-1 font-semibold text-white ${compact ? "text-base" : "text-2xl"}`}>{value}</div>
    </div>
  );
}
