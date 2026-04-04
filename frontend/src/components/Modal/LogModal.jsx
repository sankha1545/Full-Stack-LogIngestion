import { motion } from "framer-motion";
import { useEffect } from "react";
import { Copy, X } from "lucide-react";
import { classifyLogKind, formatLogTimestamp, getLogLevelTone } from "@/utils/logs";

export default function LogModal({ log, onClose }) {
  useEffect(() => {
    if (!log) return undefined;
    const handleEsc = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [log, onClose]);

  if (!log) return null;

  const metadata = log.metadata || log.meta || {};
  const kind = classifyLogKind(log);
  const level = String(log.level || "INFO").toUpperCase();

  async function copyValue(value) {
    try {
      await navigator.clipboard.writeText(String(value || ""));
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getLogLevelTone(level)}`}>{level}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{kind}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{formatLogTimestamp(log.timestamp)}</span>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">Message</div>
            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100">{log.message}</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Service" value={log.service} onCopy={copyValue} />
            <Field label="Resource" value={log.resourceId} onCopy={copyValue} />
            <Field label="Trace ID" value={log.traceId} onCopy={copyValue} />
            <Field label="Span ID" value={log.spanId} onCopy={copyValue} />
            <Field label="Commit" value={log.commit} onCopy={copyValue} />
            <Field label="Host" value={log.host} onCopy={copyValue} />
            <Field label="Environment" value={log.environment} onCopy={copyValue} />
            <Field label="Version" value={log.version} onCopy={copyValue} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Metadata</div>
              <button onClick={() => copyValue(JSON.stringify(metadata, null, 2))} className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200">
                <Copy className="h-3.5 w-3.5" /> Copy JSON
              </button>
            </div>
            <pre className="max-h-72 overflow-auto rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-emerald-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-emerald-300">{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onCopy }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="flex items-start justify-between gap-3">
        <div className="break-all text-sm text-slate-900 dark:text-slate-100">{value || "NA"}</div>
        {value && <button onClick={() => onCopy(value)} className="text-xs text-sky-600 dark:text-sky-300">Copy</button>}
      </div>
    </div>
  );
}
