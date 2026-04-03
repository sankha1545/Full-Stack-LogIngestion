import { useEffect, useRef, useState } from "react";

export default function MockTerminal({ compact = false }) {
  const [lines, setLines] = useState([]);
  const index = useRef(0);

  useEffect(() => {
    const data = [
      { level: "INFO", line: '[2026-04-03T12:42:10Z] service=auth msg="login success" user_id=42 region=ap-south-1' },
      { level: "WARN", line: '[2026-04-03T12:42:11Z] service=orders msg="slow query detected" latency_ms=420 trace_id=ord-291' },
      { level: "ERROR", line: '[2026-04-03T12:42:12Z] service=payments msg="charge failed" err_code=402 span_id=pay-771' },
      { level: "INFO", line: '[2026-04-03T12:42:13Z] service=search msg="index updated" documents=53' },
      { level: "DEBUG", line: '[2026-04-03T12:42:14Z] service=worker msg="job retried" queue=emails attempt=2' },
      { level: "FATAL", line: '[2026-04-03T12:42:15Z] service=api msg="upstream timeout" dependency=billing-gateway' },
    ];

    const timer = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, data[index.current % data.length]];
        if (next.length > (compact ? 5 : 7)) next.shift();
        return next;
      });
      index.current += 1;
    }, compact ? 1100 : 900);

    return () => clearInterval(timer);
  }, [compact]);

  return (
    <div className={`overflow-hidden rounded-2xl bg-slate-950 ${compact ? "min-h-[220px]" : "min-h-[260px]"}`}>
      <div className="space-y-2 px-3 py-3 font-mono text-sm text-slate-200">
        {lines.map((entry, i) => (
          <div key={`${entry.line}-${i}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${getDotTone(entry.level)}`} />
            <span className="flex-1 break-all leading-6 text-slate-200">{entry.line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDotTone(level) {
  switch (level) {
    case "ERROR":
      return "bg-red-400";
    case "WARN":
      return "bg-amber-400";
    case "FATAL":
      return "bg-rose-400";
    case "DEBUG":
      return "bg-slate-400";
    default:
      return "bg-emerald-400";
  }
}
