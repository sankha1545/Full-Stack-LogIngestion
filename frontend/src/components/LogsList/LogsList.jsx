import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import LogItem from "../LogItem/LogItem";
import LogModal from "../Modal/LogModal";

const LOGS_PER_PAGE = 5;

export default function LogsList({ logs = [], loading, page = 1, setPage }) {
  const [selectedLog, setSelectedLog] = useState(null);

  const totalPages = Math.max(1, Math.ceil(logs.length / LOGS_PER_PAGE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const startIndex = (safePage - 1) * LOGS_PER_PAGE;
  const endIndex = startIndex + LOGS_PER_PAGE;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  const handleNext = () => safePage < totalPages && setPage(safePage + 1);
  const handlePrev = () => safePage > 1 && setPage(safePage - 1);

  if (loading)
    return <p className="p-4 text-center text-slate-500">Loading logs...</p>;

  if (!logs.length)
    return <p className="p-4 text-center text-slate-500">No logs found</p>;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={safePage}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="space-y-2"
        >
          {paginatedLogs.map((log, i) => (
            <LogItem
              key={log.timestamp + i}
              log={log}
              onClick={setSelectedLog}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex items-center justify-between p-3 text-sm border-t bg-slate-50 dark:bg-slate-900">
        <button
          disabled={safePage === 1}
          onClick={handlePrev}
          className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 disabled:opacity-40"
        >
          Prev
        </button>

        <span>
          Page {safePage} of {totalPages}
        </span>

        <button
          disabled={safePage === totalPages}
          onClick={handleNext}
          className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {selectedLog && (
        <LogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </>
  );
}
