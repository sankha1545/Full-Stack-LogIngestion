import { useEffect, useRef, useState } from "react";
import { Send, Database, Search, Terminal } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * HowItWorks.jsx
 * - Responsive timeline (desktop) + stacked cards (mobile)
 * - Reveal-on-scroll with lightweight IntersectionObserver
 * - Mock terminal/log preview to show "live" ingestion
 * - Uses Tailwind + lucide-react (no extra deps)
 */

function useInViewOnce(ref, options = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12, ...options }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, options]);
  return visible;
}

const STEPS = [
  {
    id: "ingest",
    title: "Instrument & send",
    desc:
      "Send logs from applications, containers, and infrastructure using lightweight SDKs, Fluent/Beats, or OpenTelemetry.",
    icon: Send
  },
  {
    id: "process",
    title: "Stream & enrich",
    desc:
      "Stream logs through processing pipelines: validation, enrichment (labels, traces), and partitioning for scale.",
    icon: Database
  },
  {
    id: "query",
    title: "Search & act",
    desc:
      "Query, filter, and visualize logs in real time. Turn insights into alerts, dashboards, and runbooks.",
    icon: Search
  }
];

export default function HowItWorks() {
  const rootRef = useRef(null);
  const visible = useInViewOnce(rootRef);

  return (
    <section
      id="how-it-works"
      ref={rootRef}
      className="relative px-6 overflow-hidden py-28"
      aria-labelledby="howitworks-heading"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 w-[520px] h-[520px] bg-indigo-700/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h2 id="howitworks-heading" className="text-3xl font-bold md:text-4xl">
            How it works — in 3 steps
          </h2>
          <p className="mt-3 text-lg text-white/70">
            From application to insight: lightweight ingestion, real-time streaming & indexing, then instant search and actions.
          </p>
        </div>

        {/* Desktop: timeline + detail; Mobile: stacked */}
        <div className="grid items-start gap-10 md:grid-cols-12">
          {/* Timeline (left) */}
          <div className="hidden md:col-span-3 md:block">
            <div className="sticky top-28">
              <div className="flex flex-col items-start gap-8">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg
                        ${
                          visible ? "bg-indigo-600/20 ring-1 ring-indigo-500/40 text-indigo-400" :
                          "bg-white/5 text-white/60"
                        } transition`}
                      style={{ transitionDelay: `${120 + idx * 80}ms` }}
                      aria-hidden
                    >
                      <s.icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">
                        {idx + 1}. {s.title}
                      </div>
                      <div className="mt-1 text-sm text-white/70 max-w-[220px]">
                        {s.desc.length > 60 ? s.desc.slice(0, 60) + "…" : s.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content (center/right on desktop, full width on mobile) */}
          <div className="space-y-8 md:col-span-9">
            {/* Cards or stacked timeline on mobile */}
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`
                    rounded-2xl p-6 border border-white/8 bg-white/5
                    transform transition-all duration-500
                    ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                  `}
                  style={{ transitionDelay: `${100 + i * 80}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-none w-10 h-10 text-indigo-400 rounded-lg bg-indigo-600/10 ring-1 ring-indigo-500/30">
                      <s.icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm text-white/70">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Two-column detail: terminal preview + explanation */}
            <div className="grid items-start gap-6 md:grid-cols-2">
              {/* Explanation column */}
              <div className={`
                rounded-2xl p-6 border border-white/8 bg-white/5
                transform transition-all duration-500
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `} style={{ transitionDelay: "340ms" }}>
                <h4 className="text-xl font-semibold">From events to answers</h4>
                <p className="mt-3 leading-relaxed text-white/70">
                  LogScope ingests logs with append-only semantics, processes them through configurable pipelines
                  (enrichment, label extraction, sampling), and stores them in optimized indexes so queries return
                  quickly even at large scale. Apply retention & RBAC rules per workspace.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  <li>• Ingest via SDKs, OTLP, or agent collectors.</li>
                  <li>• Stream processing with enrichers & processors.</li>
                  <li>• Low-latency indexes for sub-second queries.</li>
                </ul>

                <div className="flex gap-3 mt-6">
                  <Link to="/signup" className="inline-flex items-center gap-2 px-4 py-2 transition bg-indigo-600 rounded-lg hover:bg-indigo-500">
                    Try LogScope
                  </Link>
                  <Link to="/docs" className="inline-flex items-center gap-2 px-4 py-2 transition rounded-lg bg-white/5 hover:bg-white/10">
                    Read docs
                  </Link>
                </div>
              </div>

              {/* Terminal / log preview */}
              <div className={`
                rounded-2xl p-4 border border-white/8 bg-black/80
                transform transition-all duration-500
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `} style={{ transitionDelay: "420ms" }}>
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400/90" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/90" />
                    <span className="w-3 h-3 rounded-full bg-green-400/90" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Terminal className="w-4 h-4" /> Live ingestion
                  </div>
                </div>

                <MockTerminalLines />
              </div>
            </div>
          </div>
        </div>

        {/* optional small caption */}
        <div className="mt-10 text-sm text-center text-white/60">
          Fast ingestion • Safe retention • Instant queries — built for modern stacks.
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Mock terminal: small simulated streaming lines to convey live behavior     */
/* -------------------------------------------------------------------------- */
function MockTerminalLines() {
  const [lines, setLines] = useState([]);
  const idxRef = useRef(0);
  useEffect(() => {
    const sample = [
      '[2026-02-06T07:22:10Z] service=auth level=info msg="login success" user_id=42',
      '[2026-02-06T07:22:11Z] service=orders level=warn msg="slow db" latency_ms=420',
      '[2026-02-06T07:22:12Z] service=payments level=error msg="charge failed" err_code=402',
      '[2026-02-06T07:22:13Z] service=auth level=info msg="token refresh" user_id=17',
      '[2026-02-06T07:22:14Z] service=search level=info msg="index updated" items=53'
    ];
    const t = setInterval(() => {
      setLines((prev) => {
        const next = prev.concat(sample[idxRef.current % sample.length]);
        if (next.length > 6) next.shift();
        return next;
      });
      idxRef.current += 1;
    }, 900);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="px-3 pb-3">
      <div className="h-[180px] overflow-hidden text-sm font-mono text-white/90">
        {lines.map((l, i) => (
          <div key={i} className="py-1">
            <span className="mr-3 text-white/60">{i === lines.length - 1 ? "›" : " "}</span>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
