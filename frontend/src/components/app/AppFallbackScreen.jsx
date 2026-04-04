import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppFallbackScreen({
  title = "Something went wrong",
  message = "An unexpected error interrupted the application.",
  actionLabel = "Try again",
  onRetry,
  checking = false,
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.12),transparent_26%)] dark:bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.18),transparent_28%)]" />
      <div className="relative w-full max-w-lg rounded-[32px] border border-slate-200 bg-white/92 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-[0_30px_80px_rgba(2,6,23,0.42)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-rose-50 text-rose-600 dark:bg-rose-500/12 dark:text-rose-300">
          <WifiOff className="h-8 w-8" />
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          Error fallback
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button className="rounded-2xl px-5" disabled={checking} onClick={onRetry}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : actionLabel}
          </Button>
          <Button variant="outline" className="rounded-2xl px-5" onClick={() => window.location.reload()}>
            Reload app
          </Button>
        </div>
      </div>
    </div>
  );
}
