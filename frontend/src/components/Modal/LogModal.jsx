import { motion } from "framer-motion";
import { useEffect } from "react";
import { Copy, X } from "lucide-react";

export default function LogModal({ log, onClose }) {
  if (!log) return null;

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  const levelColor = {
    error: "bg-red-500",
    warn: "bg-yellow-500",
    info: "bg-blue-500",
    debug: "bg-slate-500",
  }[log.level] || "bg-slate-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="relative w-[95%] max-w-3xl rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${levelColor}`}
            />
            <h2 className="text-lg font-semibold tracking-wide">
              Log Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition rounded-full hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
          {/* Left */}
          <div className="space-y-3">
            <Field label="Level" value={log.level} />
            <Field label="Message" value={log.message} />
            <Field label="Resource" value={log.resourceId} />
            <Field label="Timestamp" value={log.timestamp} />
          </div>

          {/* Right */}
          <div className="space-y-3">
            <Field label="Trace ID" value={log.traceId} />
            <Field label="Span ID" value={log.spanId} />
            <Field label="Commit" value={log.commit} />
          </div>
        </div>

        {/* Metadata */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Metadata</h3>
            {hasMetadata && (
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(log.metadata, null, 2)
                  )
                }
                className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
              >
                <Copy size={14} /> Copy
              </button>
            )}
          </div>

          {hasMetadata ? (
            <pre className="p-4 overflow-auto text-green-400 border rounded-lg bg-black/40 max-h-48 border-white/10">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          ) : (
            <p className="text-xs italic text-slate-400">
              No metadata available
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* Reusable field */
function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs tracking-wide uppercase text-slate-400">
        {label}
      </span>
      <span className="font-medium text-white break-all">
        {value}
      </span>
    </div>
  );
}
