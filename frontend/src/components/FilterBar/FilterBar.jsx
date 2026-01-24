import { useState, useEffect } from "react";

export default function FilterBar({ filters, setFilters }) {
  // Keep user-friendly local state for datetime inputs (datetime-local format)
  const [local, setLocal] = useState({
    search: filters.search || "",
    resourceId: filters.resourceId || "",
    level: filters.level || "",
    fromLocal: filters.from ? localIsoToInput(filters.from) : "",
    toLocal: filters.to ? localIsoToInput(filters.to) : "",
    caseSensitive: !!filters.caseSensitive,
  });

  // helper: convert ISO string to input-friendly (YYYY-MM-DDTHH:mm)
  function localIsoToInput(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day}T${hh}:${mm}`;
    } catch {
      return "";
    }
  }

  // send normalized filters to parent whenever local changes
  useEffect(() => {
    const out = {
      search: local.search || undefined,
      resourceId: local.resourceId || undefined,
      level: local.level || undefined,
      // convert local input (YYYY-MM-DDTHH:mm) to ISO string (UTC)
      from: local.fromLocal ? new Date(local.fromLocal).toISOString() : undefined,
      to: local.toLocal ? new Date(local.toLocal).toISOString() : undefined,
      caseSensitive: local.caseSensitive || false,
    };

    setFilters(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
      {/* Search */}
      <div>
        <label className="block text-xs mb-1 text-slate-500">Search</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm text-black"
          placeholder="Exact message text..."
          value={local.search}
          onChange={(e) => setLocal({ ...local, search: e.target.value })}
        />
      </div>

      {/* Resource ID */}
      <div>
        <label className="block text-xs mb-1 text-slate-500 ">Resource ID</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm text-black"
          placeholder="server-1234"
          value={local.resourceId}
          onChange={(e) => setLocal({ ...local, resourceId: e.target.value })}
        />
      </div>

      {/* Level */}
      <div>
        <label className="block text-xs mb-1 text-slate-500">Level</label>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm text-black"
          value={local.level}
          onChange={(e) => setLocal({ ...local, level: e.target.value })}
        >
          <option value="">All</option>
          <option value="error">Error</option>
          <option value="warn">Warn</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      {/* From */}
      <div>
        <label className="block text-xs mb-1 text-slate-500 ">From</label>
        <input
          type="datetime-local"
          className="w-full border rounded-lg px-3 py-2 text-sm text-black"
          value={local.fromLocal}
          onChange={(e) => setLocal({ ...local, fromLocal: e.target.value })}
        />
      </div>

      {/* To */}
      <div>
        <label className="block text-xs mb-1 text-slate-500">To</label>
        <input
          type="datetime-local"
          className="w-full border rounded-lg px-3 py-2 text-sm text-black"
          value={local.toLocal}
          onChange={(e) => setLocal({ ...local, toLocal: e.target.value })}
        />
      </div>

      {/* Case Sensitive */}
      <div className="flex items-center gap-2">
        <input
          id="caseSensitive"
          type="checkbox"
          checked={local.caseSensitive}
          onChange={(e) => setLocal({ ...local, caseSensitive: e.target.checked })}
        />
        <label htmlFor="caseSensitive" className="text-sm text-slate-600">Case-sensitive search</label>
      </div>

      {/* Clear */}
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
        className="h-10 rounded-lg bg-indigo-600"
      >
        Clear
      </button>
    </div>
  );
}
