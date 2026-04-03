import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import MockTerminal from "./HowitWorks/MockTerminal";

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-20">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1.5 text-sm font-medium text-sky-200 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
            Standardized live observability for modern teams
          </div>

          <h1 className="mt-8 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Turn raw logs into a clear, live operational workspace.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            LogScope brings ingestion, live streaming, search, filters, alerts, and analytics into one cleaner interface so teams can find issues faster and operate with more confidence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-7 py-3.5 font-medium text-white transition hover:bg-white/10"
            >
              Open dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <TrustItem icon={ShieldCheck} label="Secure multi-tenant access" />
            <TrustItem icon={Zap} label="Socket-backed live updates" />
            <TrustItem icon={BarChart3} label="Actionable analytics" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-sky-500/25 to-cyan-400/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-slate-950/88 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="border-b border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
                  Live pipeline preview
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
              <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Operator summary</div>
                <div className="mt-4 grid gap-3">
                  <MiniStat label="Logs / min" value="18.4k" tone="sky" />
                  <MiniStat label="Critical incidents" value="02" tone="rose" />
                  <MiniStat label="Services reporting" value="31" tone="emerald" />
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Terminal stream</div>
                <MockTerminal compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm text-slate-200 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/8 p-2">
          <Icon className="h-4 w-4 text-sky-300" />
        </div>
        <span>{label}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const toneMap = {
    sky: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    rose: "text-rose-300 bg-rose-400/10 border-rose-400/20",
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneMap[tone]}`}>
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
