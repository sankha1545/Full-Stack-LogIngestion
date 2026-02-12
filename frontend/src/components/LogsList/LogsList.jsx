// src/components/LogsList/LogsList.jsx
import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LogItem from "../LogItem/LogItem";
import LogModal from "../Modal/LogModal";

const LOGS_PER_PAGE_OPTIONS = [5, 10, 20];
const DEFAULT_PER_PAGE = 5;

export default function LogsList({ logs = [], loading, page = 1, setPage }) {
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedLog, setSelectedLog] = useState(null);

  const totalPages = Math.max(1, Math.ceil(logs.length / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const startIndex = (safePage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  const handleNext = () => safePage < totalPages && setPage(safePage + 1);
  const handlePrev = () => safePage > 1 && setPage(safePage - 1);

  if (loading) return <p className="p-6 text-center text-slate-600">Loading logs…</p>;
  if (!logs.length) return <p className="p-6 text-center text-slate-600">No logs found</p>;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${safePage}-${perPage}-${logs.length}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-2"
        >
          {paginatedLogs.map((log, i) => (
            <LogItem key={`${log.timestamp}-${i}`} log={log} onClick={setSelectedLog} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex items-center justify-between p-3 border-t">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={safePage === 1}
            className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="inline-block w-4 h-4 mr-1" /> Prev
          </button>

          <div className="text-sm">
            Page <span className="font-medium">{safePage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={safePage === totalPages}
            className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-40"
          >
            Next <ChevronRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label>Per page</label>
          <select
            value={perPage}
            onChange={(e) => {
              const nv = Number(e.target.value);
              setPerPage(nv);
              setPage(1);
            }}
            className="px-2 py-1 border rounded"
          >
            {LOGS_PER_PAGE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedLog && <LogModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
