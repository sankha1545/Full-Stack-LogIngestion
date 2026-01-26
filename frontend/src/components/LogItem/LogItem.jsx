export default function LogItem({ log, onClick }) {
  const levelColors = {
    error: "border-l-4 border-red-500 bg-red-50/10",
    warn: "border-l-4 border-yellow-500 bg-yellow-50/10",
    info: "border-l-4 border-blue-500 bg-blue-50/10",
    debug: "border-l-4 border-gray-500 bg-gray-50/10",
  };

  const levelStyles = {
    error: {
      badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    warn: {
      badge:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    info: {
      badge:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    debug: {
      badge:
        "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    },
  };

  const colorClass = levelColors[log.level] || levelColors.debug;
  const badgeClass = (levelStyles[log.level] || levelStyles.debug).badge;

  function formatIST(utc) {
    const d = new Date(utc);
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return (
    <div
      onClick={() => onClick?.(log)}
      className={`flex gap-3 p-4 rounded-md overflow-hidden transition cursor-pointer
      hover:shadow-md hover:scale-[1.01] hover:bg-slate-100 dark:hover:bg-slate-800
      ${colorClass}`}
    >
      <div className="flex-1">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-0.5 rounded font-semibold ${badgeClass}`}
          >
            {log.level.toUpperCase()}
          </span>

          <time className="text-xs text-slate-500 dark:text-slate-400">
            {formatIST(log.timestamp)} IST
          </time>
        </div>

        {/* Message */}
        <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
          {log.message}
        </p>

        {/* Meta */}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {log.resourceId} · {log.traceId} · {log.spanId} · {log.commit}
        </p>
      </div>
    </div>
  );
}
