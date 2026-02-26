// src/components/LogsList/LogsList.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import LogItem from "../LogItem/LogItem";
import LogModal from "../Modal/LogModal";

/* =====================================================
   CONFIG
==================================================== */

const LOGS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PER_PAGE = 10;

/* =====================================================
   COMPONENT
==================================================== */

export default function LogsList({ logs = [], loading = false }) {
  /* =====================================================
     STATE
  ===================================================== */
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedLog, setSelectedLog] = useState(null);

  /* =====================================================
     SAFE LOG ARRAY
     memoize to avoid needless recalculations
  ===================================================== */
  const safeLogs = useMemo(() => (Array.isArray(logs) ? logs : []), [logs]);

  /* =====================================================
     PAGINATION CALCULATIONS
  ===================================================== */

  const totalPages = useMemo(() => Math.max(1, Math.ceil(safeLogs.length / perPage)), [safeLogs.length, perPage]);

  // keep `page` bounded to [1, totalPages]
  useEffect(() => {
    setPage((prev) => {
      if (prev < 1) return 1;
      if (prev > totalPages) return totalPages;
      return prev;
    });
  }, [totalPages]);

  const safePage = useMemo(() => Math.min(Math.max(page, 1), totalPages), [page, totalPages]);

  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * perPage;
    const end = start + perPage;
    return safeLogs.slice(start, end);
  }, [safeLogs, safePage, perPage]);

  /* =====================================================
     RESET PAGE WHEN LOGS CHANGE (keeps UX predictable)
  ===================================================== */
  useEffect(() => {
    setPage(1);
  }, [logs]);

  /* =====================================================
     DEV DEBUG (minimal)
  ===================================================== */
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[LogsList] items:", safeLogs.length, "page:", safePage, "perPage:", perPage);
    }
  }, [safeLogs.length, safePage, perPage]);

  /* =====================================================
     ACTIONS (stable callbacks)
  ===================================================== */

  const goFirst = useCallback(() => setPage(1), []);
  const goLast = useCallback(() => setPage(totalPages), [totalPages]);
  const goPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

  /* Keyboard navigation: left/right arrows for prev/next */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  /* =====================================================
     LOADING / EMPTY STATES
  ===================================================== */

  if (loading)
    return (
      <div className="p-6 text-center text-slate-500">
        Loading logs...
      </div>
    );

  if (!loading && safeLogs.length === 0)
    return (
      <div className="p-6 text-center text-slate-500">
        No logs found
      </div>
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Showing <span className="mx-1 font-medium">{paginatedLogs.length}</span> of{" "}
          <span className="mx-1 font-medium">{safeLogs.length}</span> logs
        </div>

        <div className="flex items-center gap-3">
          {/* First / Prev */}
          <div className="flex items-center gap-1">
            <button
              onClick={goFirst}
              disabled={safePage === 1}
              aria-label="First page"
              className="flex items-center gap-1 px-2 py-1 border rounded disabled:opacity-40"
            >
              <ChevronsLeft size={14} />
            </button>

            <button
              onClick={goPrev}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="flex items-center gap-1 px-2 py-1 border rounded disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
          </div>

          {/* Page indicator */}
          <div className="text-sm">
            Page <span className="mx-1 font-semibold">{safePage}</span> of{" "}
            <span className="mx-1 font-semibold">{totalPages}</span>
          </div>

          {/* Next / Last */}
          <div className="flex items-center gap-1">
            <button
              onClick={goNext}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="flex items-center gap-1 px-2 py-1 border rounded disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>

            <button
              onClick={goLast}
              disabled={safePage === totalPages}
              aria-label="Last page"
              className="flex items-center gap-1 px-2 py-1 border rounded disabled:opacity-40"
            >
              <ChevronsRight size={14} />
            </button>
          </div>

          {/* Per page selector */}
          <div className="flex items-center gap-2 text-sm">
            <span>Per page</span>
            <select
              value={perPage}
              onChange={(e) => {
                const n = Number(e.target.value);
                setPerPage(n);
                setPage(1); // reset page whenever perPage changes
              }}
              className="px-2 py-1 border rounded"
              aria-label="Logs per page"
            >
              {LOGS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LOG LIST */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`page-${safePage}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-2"
        >
          {paginatedLogs.map((log) => (
            <LogItem key={log.id} log={log} onClick={setSelectedLog} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination (redundant but helpful on long pages) */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={safePage === 1}
            className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
        </div>

        <div className="text-sm">
          Page <span className="mx-1 font-semibold">{safePage}</span> of{" "}
          <span className="mx-1 font-semibold">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goNext}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedLog && <LogModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </AnimatePresence>
    </div>
  );
}