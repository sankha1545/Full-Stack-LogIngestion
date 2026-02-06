import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Puzzle, ShieldCheck, Rocket, Star, Users } from "lucide-react";

const FEATURES = [
  {
    title: "One unified view",
    description:
      "Logs, metrics, and analytics in one place — stop switching tools.",
    icon: Puzzle,
  },
  {
    title: "Built for reliability",
    description:
      "Predictable ingestion, retention policies, and role-based access.",
    icon: ShieldCheck,
  },
  {
    title: "Fast by design",
    description:
      "Optimized pipelines and indexes for sub-second queries at scale.",
    icon: Rocket,
  },
];

function useReveal(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

export default function About() {
  const ref = useRef(null);
  const visible = useReveal(ref);

  return (
    <section
      ref={ref}
      className="relative px-6 overflow-hidden py-28"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 w-[420px] h-[420px] bg-indigo-600/10 blur-[160px]" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[360px] h-[360px] bg-purple-600/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Why teams choose LogScope
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Observability that removes friction — built for modern systems.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid max-w-3xl grid-cols-3 gap-6 mx-auto mb-16">
          {[
            { icon: Users, label: "Teams onboarded", value: "200+" },
            { icon: Star, label: "Uptime SLA", value: "99.99%" },
            { icon: Rocket, label: "Query latency", value: "Sub-second" },
          ].map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center p-6 border rounded-xl border-white/10 bg-white/5"
            >
              <m.icon className="w-6 h-6 text-indigo-400" />
              <div className="mt-3 text-xl font-semibold">{m.value}</div>
              <div className="text-sm text-white/70">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid items-start gap-12 md:grid-cols-2">
          {/* Story */}
          <div
            className={`transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h3 className="mb-4 text-xl font-semibold">
              A single source of truth
            </h3>
            <p className="leading-relaxed text-white/75">
              Modern systems generate massive observability data. LogScope gives
              teams a unified, searchable, and secure platform so incidents are
              resolved faster.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>• Append-only ingestion</li>
              <li>• Structured metadata & filtering</li>
              <li>• RBAC and retention policies</li>
            </ul>

            <div className="flex gap-3 mt-8">
              <Link
                to="/signup"
                className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                Try free
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                Contact sales
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`p-6 rounded-2xl border border-white/10 bg-white/5 transition-all duration-700 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10">
                    <f.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{f.title}</h4>
                    <p className="mt-2 text-white/70">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
