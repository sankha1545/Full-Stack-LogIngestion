import { LoaderCircle } from "lucide-react";

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_28%)]" />
      <div className="relative w-full max-w-sm rounded-[28px] border border-slate-200 bg-white/92 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sky-600 dark:border-slate-800 dark:bg-slate-900 dark:text-sky-300">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500 [animation-delay:-0.3s]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500 [animation-delay:-0.15s]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500" />
        </div>
      </div>
    </div>
  );
}
