import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Server,
  BarChart3,
  Shield,
  Search,
  Zap,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * UseCases.jsx
 *
 * - Persona tabs (All / SRE / Developer / Product)
 * - Responsive card grid (1/2/3 columns)
 * - Reveal-on-scroll animations (tiny hook)
 * - Each card: icon, title, short description, impact + CTAs
 *
 * Requires: lucide-react, Tailwind CSS
 */

const ALL_CASES = [
  {
    id: "incidents",
    title: "Debug production incidents",
    desc:
      "Aggregate traces, logs and events to reconstruct incidents quickly and reliably.",
    impact: "Reduce MTTR by surfacing related traces & errors together.",
    icon: Activity,
    personas: ["sre", "developer"]
  },
  {
    id: "health",
    title: "Monitor microservices health",
    desc:
      "Track service-level metrics, error rates and log patterns across clusters.",
    impact: "Detect regressions earlier with continuous health checks.",
    icon: Server,
    personas: ["sre"]
  },
  {
    id: "perf",
    title: "Analyze application performance",
    desc:
      "Correlate latency spikes with logs and deployment events to find root causes.",
    impact: "Improve user experience by identifying heavy paths and hot functions.",
    icon: BarChart3,
    personas: ["developer", "product"]
  },
  {
    id: "audit",
    title: "Audit system behavior",
    desc:
      "Immutable, append-only log stores and queryable trails for compliance & audits.",
    impact: "Meet compliance requirements with searchable, tamper-resistant logs.",
    icon: Shield,
    personas: ["product", "sre"]
  },
  {
    id: "search",
    title: "Ad-hoc log search & exploration",
    desc:
      "Powerful full-text and structured search to explore failures and features.",
    impact: "Faster investigations with targeted queries and saved searches.",
    icon: Search,
    personas: ["developer", "sre"]
  },
  {
    id: "alerts",
    title: "Automated alerting & runbooks",
    desc:
      "Turn query results into alerts and attach runbooks for faster response.",
    impact: "Consistent incident response and reduced on-call toil.",
    icon: Zap,
    personas: ["sre", "product"]
  }
];

function useInView(ref, options = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12, ...options }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, options]);
  return inView;
}

function PersonaTabs({ value, onChange }) {
  const tabs = [
    { id: "all", label: "All" },
    { id: "sre", label: "SRE" },
    { id: "developer", label: "Developer" },
    { id: "product", label: "Product" }
  ];

  return (
    <div role="tablist" aria-label="Filter use cases" className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-sm rounded-md focus:outline-none transition
            ${value === t.id ? "bg-indigo-600 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function UseCaseCard({ item, index, visible }) {
  const Icon = item.icon;
  const delay = 80 + index * 80;
  return (
    <article
      className={`
        rounded-2xl border border-white/10 bg-white/5 p-5
        transition-transform duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
      `}
      style={{ transitionDelay: `${delay}ms` }}
      tabIndex={0}
      aria-labelledby={`uc-${item.id}-title`}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center flex-none w-12 h-12 text-indigo-400 rounded-lg bg-indigo-600/10 ring-1 ring-indigo-500/30">
          <Icon className="w-6 h-6" />
        </div>

        <div className="min-w-0">
          <h3 id={`uc-${item.id}-title`} className="text-lg font-semibold">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-white/70">{item.desc}</p>

          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-white/60">{item.impact}</div>

            <div className="flex items-center gap-2">
              <Link
                to={`/templates/${item.id}`}
                className="px-3 py-1 text-sm transition rounded-md bg-indigo-600/90 hover:bg-indigo-500"
              >
                Try template
              </Link>
              <Link
                to={`/docs/use-cases#${item.id}`}
                className="px-3 py-1 text-sm transition rounded-md bg-white/5 hover:bg-white/10"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function UseCases() {
  const ref = useRef(null);
  const visible = useInView(ref);
  const [persona, setPersona] = useState("all");

  const filtered =
    persona === "all"
      ? ALL_CASES
      : ALL_CASES.filter((c) => c.personas.includes(persona));

  return (
    <section id="use-cases" className="relative px-6 overflow-hidden py-28" ref={ref}>
      {/* Ambient background for depth */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-160px] top-[-120px] w-[420px] h-[420px] bg-indigo-700/8 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header + persona tabs */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Use Cases</h2>
            <p className="max-w-xl mt-2 text-white/70">
              Practical ways teams use LogScope — for reliability, performance, and compliance.
            </p>
          </div>

          <div className="md:ml-4">
            <PersonaTabs value={persona} onChange={setPersona} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <UseCaseCard key={c.id} item={c} index={i} visible={visible} />
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col gap-4 mt-10 md:flex-row md:items-center md:justify-between">
          <div className="text-white/70">
            Want to explore examples? Try our presets for common stacks (K8s, Node, Python).
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-4 py-2 transition bg-indigo-600 rounded-md hover:bg-indigo-500"
            >
              View templates
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 transition rounded-md bg-white/5 hover:bg-white/10"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
