// src/components/landingpage/HowitWorks/HowItWorks.jsx
import { useRef } from "react";
import Timeline from "./Timeline";
import StepCard from "./StepCard";
import MockTerminal from "./MockTerminal";
import { Link } from "react-router-dom";

/**
 * HowItWorks.jsx
 * - Composes smaller components (Timeline, StepCard, MockTerminal)
 * - Keeps presentation logic here; components are pure and reusable
 */

const STEPS = [
  {
    id: "ingest",
    title: "Instrument & send",
    desc:
      "Send logs from applications, containers, and infrastructure using lightweight SDKs, Fluent/Beats, or OpenTelemetry."
  },
  {
    id: "process",
    title: "Stream & enrich",
    desc:
      "Stream logs through processing pipelines: validation, enrichment (labels, traces), and partitioning for scale."
  },
  {
    id: "query",
    title: "Search & act",
    desc:
      "Query, filter, and visualize logs in real time. Turn insights into alerts, dashboards, and runbooks."
  }
];

export default function HowItWorks() {
  const rootRef = useRef(null);

  return (
    <section
      id="how-it-works"
      ref={rootRef}
      className="relative px-6 overflow-hidden py-28"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -left-40 -top-40 w-[520px] h-[520px] bg-indigo-700/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            How it works — in 3 steps
          </h2>
          <p className="mt-3 text-lg text-white/70">
            From application to insight: lightweight ingestion, real-time streaming & indexing, then instant search and actions.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          {/* Timeline (left) */}
          <div className="hidden md:block md:col-span-3">
            <div className="sticky top-28">
              <Timeline steps={STEPS} />
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8 md:col-span-9">
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <StepCard
                  key={s.id}
                  index={i}
                  title={s.title}
                  description={s.desc}
                />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 border rounded-2xl border-white/8 bg-white/5">
                <h4 className="text-xl font-semibold text-white">From events to answers</h4>
                <p className="mt-3 leading-relaxed text-white/70">
                  LogScope ingests logs with append-only semantics, processes them
                  through configurable pipelines, and stores them in optimized
                  indexes for fast querying at scale.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  <li>• SDK, OTLP, and agent-based ingestion</li>
                  <li>• Real-time enrichment & stream processing</li>
                  <li>• Sub-second search performance</li>
                </ul>

                <div className="flex gap-3 mt-6">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-4 py-2 text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-500"
                  >
                    Try LogScope
                  </Link>

                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-2 px-4 py-2 text-white transition rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    Read docs
                  </Link>
                </div>
              </div>

              <div className="p-4 border rounded-2xl border-white/8 bg-black/80">
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 bg-red-400 rounded-full" />
                    <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M8 17l8-5-8-5v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Live ingestion
                  </div>
                </div>

                <MockTerminal />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm text-center text-white/60">
          Fast ingestion • Secure retention • Instant insights
        </p>
      </div>
    </section>
  );
}
