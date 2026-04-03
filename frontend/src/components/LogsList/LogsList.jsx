import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import LogItem from "../LogItem/LogItem";
import LogModal from "../Modal/LogModal";

const LOGS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_PER_PAGE = 10;

export default function LogsList({ logs = [], loading = false }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedLog, setSelectedLog] = useState(null);

  const safeLogs = useMemo(() => (Array.isArray(logs) ? logs : []), [logs]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(safeLogs.length / perPage)), [safeLogs.length, perPage]);
  const safePage = useMemo(() => Math.min(Math.max(page, 1), totalPages), [page, totalPages]);

  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return safeLogs.slice(start, start + perPage);
  }, [perPage, safeLogs, safePage]);

  useEffect(() => {
    setPage(1);
  }, [logs]);

  const goFirst = useCallback(() => setPage(1), []);
  const goLast = useCallback(() => setPage(totalPages), [totalPages]);
  const goPrev = useCallback(() => setPage((value) => Math.max(1, value - 1)), []);
  const goNext = useCallback(() => setPage((value) => Math.min(totalPages, value + 1)), [totalPages]);

  if (loading) {
    return <div className="rounded-[24px] border border-dashed border-slate-200 p-10 text-center text-slate-500">Loading logs...</div>;
  }

  if (safeLogs.length === 0) {
    return <div className="rounded-[24px] border border-dashed border-slate-200 p-10 text-center text-slate-500">No logs found</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-950">{paginatedLogs.length}</span> of <span className="font-semibold text-slate-950">{safeLogs.length}</span> logs
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <select
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              {LOGS_PER_PAGE_OPTIONS.map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>

          <div className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-600">
            Page {safePage} of {totalPages}
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`page-${safePage}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {paginatedLogs.map((log) => (
            <LogItem key={log.id} log={log} onClick={setSelectedLog} />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2">
          <PagerButton onClick={goFirst} disabled={safePage === 1}><ChevronsLeft className="h-4 w-4" /></PagerButton>
          <PagerButton onClick={goPrev} disabled={safePage === 1}><ChevronLeft className="h-4 w-4" /> Prev</PagerButton>
        </div>

        <div className="text-sm text-slate-600">Page <span className="font-semibold text-slate-950">{safePage}</span> of <span className="font-semibold text-slate-950">{totalPages}</span></div>

        <div className="flex items-center gap-2">
          <PagerButton onClick={goNext} disabled={safePage === totalPages}>Next <ChevronRight className="h-4 w-4" /></PagerButton>
          <PagerButton onClick={goLast} disabled={safePage === totalPages}><ChevronsRight className="h-4 w-4" /></PagerButton>
        </div>
      </div>

      <AnimatePresence>{selectedLog && <LogModal log={selectedLog} onClose={() => setSelectedLog(null)} />}</AnimatePresence>
    </div>
  );
}

function PagerButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
