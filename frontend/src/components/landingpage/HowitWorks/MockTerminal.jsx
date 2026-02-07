// src/components/landingpage/HowitWorks/MockTerminal.jsx
import { useEffect, useRef, useState } from "react";

/**
 * MockTerminal — small streaming terminal preview component
 * - keeps a small in-memory ring buffer of lines
 */

export default function MockTerminal() {
  const [lines, setLines] = useState([]);
  const index = useRef(0);

  useEffect(() => {
    const data = [
      '[2026-02-06T07:22:10Z] service=auth level=info msg="login success" user_id=42',
      '[2026-02-06T07:22:11Z] service=orders level=warn msg="slow db" latency_ms=420',
      '[2026-02-06T07:22:12Z] service=payments level=error msg="charge failed" err_code=402',
      '[2026-02-06T07:22:13Z] service=auth level=info msg="token refresh" user_id=17',
      '[2026-02-06T07:22:14Z] service=search level=info msg="index updated" items=53'
    ];

    const t = setInterval(() => {
      setLines(prev => {
        const next = [...prev, data[index.current % data.length]];
        if (next.length > 6) next.shift();
        return next;
      });
      index.current++;
    }, 900);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="px-3 pb-3 h-[180px] text-sm font-mono text-white/90 overflow-hidden">
      {lines.map((l, i) => (
        <div key={i} className="flex py-1">
          <span className="mr-3 text-white/60">›</span>
          <span className="truncate">{l}</span>
        </div>
      ))}
    </div>
  );
}
