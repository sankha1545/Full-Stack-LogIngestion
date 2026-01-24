import { AnimatePresence, motion } from "framer-motion";
import LogItem from "../LogItem/LogItem";

const LOGS_PER_PAGE = 5;

export default function LogsList({ logs = [], loading, page = 1, setPage }) {
  const totalPages = Math.max(1, Math.ceil(logs.length / LOGS_PER_PAGE));

  // clamp page safely
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const startIndex = (safePage - 1) * LOGS_PER_PAGE;
  const endIndex = startIndex + LOGS_PER_PAGE;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  const handleNext = () => {
    if (safePage < totalPages) setPage(safePage + 1);
  };

  const handlePrev = () => {
    if (safePage > 1) setPage(safePage - 1);
  };

  if (loading) {
    return (
      <p className="p-4 text-center text-slate-500 dark:text-slate-400">
        Loading logs...
      </p>
    );
  }

  if (!logs.length) {
    return (
      <p className="p-4 text-center text-slate-500 dark:text-slate-400">
        No logs found
      </p>
    );
  }

  return (
    <>
      {/* Animated page container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={safePage} // triggers animation on page change
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="space-y-2"

        >
          {paginatedLogs.map((log, i) => (
            <LogItem key={log.timestamp + i} log={log} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex justify-between items-center p-3 border-t border-slate-200 dark:border-slate-800 text-sm bg-slate-50 dark:bg-slate-900">
        <button
          disabled={safePage === 1}
          onClick={handlePrev}
          className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="text-slate-600 dark:text-slate-400">
          Page {safePage} of {totalPages}
        </span>

        <button
          disabled={safePage === totalPages}
          onClick={handleNext}
          className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </>
  );
}
