import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex items-center min-h-screen overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-600/20 blur-[180px]" />
        <div className="absolute -bottom-72 -right-48 w-[700px] h-[700px] bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-1/3 -left-56 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px]" />
      </div>

      <div className="relative w-full px-6 mx-auto max-w-7xl">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 mb-8 text-sm font-medium text-indigo-400 rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/30 backdrop-blur">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          Modern Observability Platform
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Logs that finally{" "}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              make sense
            </span>
          </span>
          <br className="hidden sm:block" />
          in real time
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mt-6 text-lg leading-relaxed text-white/70">
          LogScope centralizes log ingestion, real-time search, and analytics —
          giving teams instant clarity across distributed systems.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-4 mt-10 sm:flex-row sm:items-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 py-3 font-medium transition-all bg-indigo-600 group px-7 rounded-xl hover:bg-indigo-500"
          >
            Get started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center py-3 font-medium transition border px-7 rounded-xl border-white/20 bg-white/5 hover:bg-white/10"
          >
            Login
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center gap-6 mt-12 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Secure by default
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            Real-time ingestion
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full" />
            Built for scale
          </div>
        </div>
      </div>
    </section>
  );
}
