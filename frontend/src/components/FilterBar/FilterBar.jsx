import { useState, useEffect } from "react";

const QUICK = [
  { label: "15m", min: 15 },
  { label: "1h", min: 60 },
  { label: "24h", min: 1440 },
  { label: "7d", min: 10080 },
  { label: "All", min: null },
];

export default function FilterBar({ filters, setFilters }) {
  const [local, setLocal] = useState({
    search: filters.search || "",
    resourceId: filters.resourceId || "",
    level: filters.level || "",
    fromLocal: filters.from ? isoToInput(filters.from) : "",
    toLocal: filters.to ? isoToInput(filters.to) : "",
    caseSensitive: !!filters.caseSensitive,
  });

  const [activeQuick, setActiveQuick] = useState(null);

  function isoToInput(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${hh}:${mm}`;
  }

  function toLocalISO(dt) {
    const d = new Date(dt);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  }

  function applyQuick(q) {
    setActiveQuick(q?.label || null);

    if (!q?.min) {
      setLocal({ ...local, fromLocal: "", toLocal: "" });
      return;
    }

    const now = new Date();
    const from = new Date(now.getTime() - q.min * 60000);

    setLocal({
      ...local,
      fromLocal: isoToInput(from.toISOString()),
      toLocal: isoToInput(now.toISOString()),
    });
  }

  useEffect(() => {
    const out = {
      search: local.search || undefined,
      resourceId: local.resourceId || undefined,
      level: local.level || undefined,
      from: local.fromLocal ? toLocalISO(local.fromLocal) : undefined,
      to: local.toLocal ? toLocalISO(local.toLocal) : undefined,
      caseSensitive: local.caseSensitive || false,
    };
    setFilters(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="space-y-3">

      {/* Quick Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs text-slate-500">Quick:</span>
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => applyQuick(q)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition
              ${activeQuick === q.label
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Main Filters */}
      <div className="grid items-end grid-cols-1 gap-3 p-3 bg-white border rounded-lg shadow-sm sm:grid-cols-2 lg:grid-cols-7 dark:bg-slate-900 border-slate-200 dark:border-slate-800">

        <Input label="Search" value={local.search}
          onChange={(v) => setLocal({ ...local, search: v })} />

        <Input label="Resource" value={local.resourceId}
          onChange={(v) => setLocal({ ...local, resourceId: v })} />

        <Select label="Level" value={local.level}
          onChange={(v) => setLocal({ ...local, level: v })} />

        <DateInput label="From" value={local.fromLocal}
          onChange={(v) => setLocal({ ...local, fromLocal: v })} />

        <DateInput label="To" value={local.toLocal}
          onChange={(v) => setLocal({ ...local, toLocal: v })} />

        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            checked={local.caseSensitive}
            onChange={(e) =>
              setLocal({ ...local, caseSensitive: e.target.checked })
            }
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Case-sensitive
          </span>
        </div>

        <button
          onClick={() =>
            setLocal({
              search: "",
              resourceId: "",
              level: "",
              fromLocal: "",
              toLocal: "",
              caseSensitive: false,
            })
          }
          className="h-10 text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* ---------- small UI components ---------- */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-xs text-slate-500">{label}</label>
      <input
        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-xs text-slate-500">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        <option value="error">Error</option>
        <option value="warn">Warn</option>
        <option value="info">Info</option>
        <option value="debug">Debug</option>
      </select>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-xs text-slate-500">{label}</label>
      <input
        type="datetime-local"
        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
