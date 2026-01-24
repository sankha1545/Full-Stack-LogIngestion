import { useState, useEffect } from "react";
import { useLogs } from "../hooks/useLogs";
import FilterBar from "../components/FilterBar/FilterBar";
import LogsList from "../components/LogsList/LogsList";

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const { logs, loading } = useLogs(filters);

  const [page, setPage] = useState(1);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Logs</h1>
          <p className="text-sm text-slate-500">
            Real-time Log Ingestion & Querying
          </p>
        </div>
      </header>

      <section className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-4 shadow">
        <FilterBar filters={filters} setFilters={setFilters} />
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow overflow-hidden text-slate-900 dark:text-slate-100">
        <LogsList
          logs={logs}
          loading={loading}
          page={page}
          setPage={setPage}
        />
      </section>
    </div>
  );
}
