import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Timeline from "./Timeline";
import StepCard from "./StepCard";
import MockTerminal from "./MockTerminal";

const STEPS = [
  {
    id: "ingest",
    title: "Instrument and send",
    desc: "Connect applications, containers, and services with SDKs or pipeline agents and start receiving events immediately.",
  },
  {
    id: "process",
    title: "Stream and enrich",
    desc: "Attach service context, traces, environment labels, and structured metadata before the logs land in search.",
  },
  {
    id: "query",
    title: "Investigate and act",
    desc: "Tail live logs, inspect detailed payloads, use filters, and move into analytics and alerts without switching tools.",
  },
];

export default function HowItWorks() {
  const rootRef = useRef(null);

  return (
    <section id="how-it-works" ref={rootRef} className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-sm text-sky-200">
            Workflow
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-white md:text-4xl">
            A clearer path from ingestion to insight.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            The experience now feels more guided and standard: understand the flow, preview the terminal stream, and see where logs become action.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div className="hidden md:col-span-3 md:block">
            <div className="sticky top-28 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <Timeline steps={STEPS} />
            </div>
          </div>

          <div className="space-y-8 md:col-span-9">
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <StepCard key={step.id} index={index} title={step.title} description={step.desc} />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-7">
                <h4 className="text-2xl font-semibold text-white">From events to answers</h4>
                <p className="mt-4 leading-8 text-slate-300">
                  LogScope ingests logs, enriches them with structured context, and presents them in a cleaner interface for search, live tailing, and analytics.
                </p>

                <div className="mt-6 space-y-3 text-sm text-slate-200">
                  <FeatureBullet text="SDK, pipeline, and agent-based ingestion" />
                  <FeatureBullet text="Live terminal stream with structured highlights" />
                  <FeatureBullet text="Action-oriented logs, filters, and visual analytics" />
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-slate-950">
                    Try LogScope
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/docs" className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-5 py-3 font-medium text-white">
                    Read docs
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    Live stream
                  </div>
                </div>
                <MockTerminal />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureBullet({ text }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-4 w-4 text-sky-300" />
      <span>{text}</span>
    </div>
  );
}
