// src/components/FilterBar/FilterBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [dateError, setDateError] = useState("");
  const debounceRef = useRef(null);

  /* ---------- Helpers ---------- */

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

  function validateDates(from, to) {
    if (!from || !to) {
      setDateError("");
      return true;
    }
    if (new Date(from) > new Date(to)) {
      setDateError("From date must not be greater than To date");
      return false;
    }
    setDateError("");
    return true;
  }

  /* ---------- Quick Filters ---------- */

  function applyQuick(q) {
    setActiveQuick(q?.label || null);

    if (!q?.min) {
      setLocal((s) => ({ ...s, fromLocal: "", toLocal: "" }));
      return;
    }

    const now = new Date();
    const from = new Date(now.getTime() - q.min * 60000);

    setLocal((s) => ({
      ...s,
      fromLocal: isoToInput(from.toISOString()),
      toLocal: isoToInput(now.toISOString()),
    }));
  }

  /* ---------- Debounced Apply ---------- */

  useEffect(() => {
    if (!validateDates(local.fromLocal, local.toLocal)) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({
        search: local.search || undefined,
        resourceId: local.resourceId || undefined,
        level: local.level || undefined,
        from: local.fromLocal ? toLocalISO(local.fromLocal) : undefined,
        to: local.toLocal ? toLocalISO(local.toLocal) : undefined,
        caseSensitive: local.caseSensitive || false,
      });
    }, 300);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  /* ---------- UI ---------- */

  return (
    <div className="space-y-4">
      {/* Quick pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">Quick:</span>
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => applyQuick(q)}
            className={`px-3 py-1 rounded-full text-sm border transition
              ${
                activeQuick === q.label
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white border-slate-300 hover:bg-slate-50"
              }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid items-end grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          placeholder="Search message..."
          value={local.search}
          onChange={(e) => setLocal({ ...local, search: e.target.value })}
        />

        <Input
          placeholder="Resource ID"
          value={local.resourceId}
          onChange={(e) => setLocal({ ...local, resourceId: e.target.value })}
        />

        <select
          className="h-10 px-3 border rounded-md"
          value={local.level}
          onChange={(e) => setLocal({ ...local, level: e.target.value })}
        >
          <option value="">All levels</option>
          <option value="error">Error</option>
          <option value="warn">Warn</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>

        <input
          type="datetime-local"
          className="h-10 px-3 border rounded-md"
          value={local.fromLocal}
          onChange={(e) => setLocal({ ...local, fromLocal: e.target.value })}
        />

        <input
          type="datetime-local"
          className="h-10 px-3 border rounded-md"
          value={local.toLocal}
          onChange={(e) => setLocal({ ...local, toLocal: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <Checkbox
            checked={local.caseSensitive}
            onCheckedChange={(v) =>
              setLocal({ ...local, caseSensitive: !!v })
            }
          />
          <span className="text-sm text-slate-600">Case-sensitive</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
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
        >
          Clear filters
        </Button>

        {dateError && (
          <div className="px-3 py-1 text-sm text-red-600 rounded bg-red-50">
            ⚠️ {dateError}
          </div>
        )}
      </div>
    </div>
  );
}
