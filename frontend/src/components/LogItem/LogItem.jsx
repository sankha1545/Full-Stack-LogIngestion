// src/components/LogItem/LogItem.jsx
import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Copy, Star, Share2 } from "lucide-react";

/**
 * Minimal but expressive log row.
 * Shows timestamp, level badge, resource, short message, and quick actions.
 *
 * click on the row to open modal (detailed view).
 */

export default function LogItem({ log, onClick }) {
  const [bookmarked, setBookmarked] = useState(false);

  const shortMsg = useMemo(() => {
    const s = String(log.message || "");
    return s.length > 120 ? s.slice(0, 117) + "…" : s;
  }, [log.message]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // optionally show a tiny toast if you have one
    } catch {}
  };

  const levelColor = {
    error: "bg-red-100 text-red-700",
    warn: "bg-amber-100 text-amber-700",
    info: "bg-sky-100 text-sky-700",
    debug: "bg-slate-100 text-slate-700",
  }[(log.level || "info").toLowerCase()];

  return (
    <div
      role="button"
      onClick={() => onClick && onClick(log)}
      className="group cursor-pointer p-3 border rounded-lg hover:shadow active:translate-y-[1px] transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded-md text-xs font-semibold ${levelColor}`}>
              {(log.level || "INFO").toUpperCase()}
            </div>
            <div className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
            <div className="ml-2 text-xs text-slate-400">·</div>
            <div className="ml-2 text-xs text-slate-600">{log.resourceId || "—"}</div>
          </div>

          <div className="mt-2 text-sm text-slate-700">{shortMsg}</div>

          {/* optional mini-meta */}
          {log.meta && Object.keys(log.meta).length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              {Object.entries(log.meta)
                .slice(0, 3)
                .map(([k, v]) => `${k}: ${String(v)}`)
                .join(" • ")}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBookmarked((s) => !s);
              }}
              title={bookmarked ? "Unbookmark" : "Bookmark"}
              className="p-1 rounded hover:bg-slate-100"
            >
              <Star className={`h-4 w-4 ${bookmarked ? "text-yellow-500" : "text-slate-400"}`} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(log.message || "");
                }}
                title="Copy message"
                className="p-1 rounded hover:bg-slate-100"
              >
                <Copy className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // quick share: open navigator.share if available
                  if (navigator.share) {
                    navigator.share({
                      title: `Log ${log.level}`,
                      text: `${new Date(log.timestamp).toLocaleString()} — ${log.message}`,
                    });
                  } else {
                    // fallback: copy to clipboard
                    navigator.clipboard.writeText(`${new Date(log.timestamp).toLocaleString()} — ${log.message}`);
                  }
                }}
                title="Share"
                className="p-1 rounded hover:bg-slate-100"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
