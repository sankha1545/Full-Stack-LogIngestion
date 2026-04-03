import React, { useMemo, useState } from "react";
import { Copy, Share2, Star } from "lucide-react";
import { classifyLogKind, formatLogTimestamp, getLogLevelTone } from "@/utils/logs";

export default function LogItem({ log, onClick }) {
  const [bookmarked, setBookmarked] = useState(false);

  const level = String(log?.level || "INFO").toUpperCase();
  const message = log?.message || "No message available";
  const resourceId = log?.resourceId || "No resource";
  const service = log?.service || "Unknown service";
  const timestamp = useMemo(() => formatLogTimestamp(log?.timestamp), [log?.timestamp]);
  const meta = log?.meta || log?.metadata || {};
  const kind = useMemo(() => classifyLogKind(log), [log]);
  const preview = message.length > 150 ? `${message.slice(0, 147)}...` : message;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  function shareLog() {
    const text = `${timestamp} | ${level} | ${message}`;
    if (navigator.share) {
      navigator.share({ title: `Log ${level}`, text });
    } else {
      copyText(text);
    }
  }

  return (
    <div
      role="button"
      onClick={() => onClick?.(log)}
      className="group rounded-[24px] border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full border px-2.5 py-1 font-semibold ${getLogLevelTone(level)}`}>{level}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{kind}</span>
            <span className="text-slate-500">{timestamp}</span>
          </div>

          <div className="text-sm font-medium leading-7 text-slate-900">{preview}</div>

          <div className="grid gap-2 text-xs text-slate-600 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 px-3 py-2">Service: {service}</div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">Resource: {resourceId}</div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">Trace: {log?.traceId || "NA"}</div>
          </div>

          {Object.keys(meta).length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {Object.entries(meta)
                .slice(0, 3)
                .map(([key, value]) => (
                  <span key={key} className="rounded-full border border-slate-200 px-2.5 py-1">
                    {key}: {String(value)}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setBookmarked((value) => !value);
            }}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <Star size={16} className={bookmarked ? "text-amber-500" : "text-slate-400"} />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              copyText(message);
            }}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <Copy size={16} className="text-slate-400" />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              shareLog();
            }}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <Share2 size={16} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
