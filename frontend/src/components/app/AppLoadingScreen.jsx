import { Activity, LoaderCircle } from "lucide-react";

export default function AppLoadingScreen({
  title = "Loading LogScope",
  message = "Preparing your workspace, live logs, and analytics.",
  fullscreen = true,
}) {
  return (
    <div
      className={`${
        fullscreen ? "min-h-screen" : "min-h-[320px]"
      } relative flex items-center justify-center overflow-hidden bg-transparent px-6 py-10`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="relative w-full max-w-md rounded-[32px] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88 dark:shadow-[0_30px_80px_rgba(2,6,23,0.42)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-sky-50 text-sky-600 dark:bg-sky-500/12 dark:text-sky-300">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <Activity className="h-3.5 w-3.5" />
          Loading state
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
          <div className="h-2 w-full origin-left animate-pulse rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />
        </div>
      </div>
    </div>
  );
}
