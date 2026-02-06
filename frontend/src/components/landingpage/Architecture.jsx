import { useEffect, useRef, useState } from "react";
import {
  Server,
  Database,
  Layers,
  Sliders,
  Box,
  ArrowRightCircle,
  Github,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Architecture.jsx
 *
 * Responsive, animated architecture overview inspired by the Grafana image.
 * - Left column: "Your tools / data"
 * - Center: layered platform card (Visualization, Solutions tiles, Key capabilities, Building blocks)
 * - Right: "No lock-in / outcomes"
 *
 * Animations: each visual block fades & slides in with a stagger using IntersectionObserver.
 *
 * Note: Tailwind classes assumed available.
 */

function useInView(ref, options = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            observer.disconnect(); // one-shot: animate once
          }
        });
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  return inView;
}

function SmallCard({ title, children, className = "", icon }) {
  return (
    <div
      className={`rounded-xl p-4 text-left bg-white/5 border border-white/8 ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 text-indigo-400 rounded bg-indigo-600/10 ring-1 ring-indigo-500/30">
            {icon}
          </div>
        )}
        <div>
          <div className="font-semibold">{title}</div>
          {children && <div className="text-sm text-white/70">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function CenterLayer({
  inView,
  delay = 0,
  title,
  className = "",
  children,
  subtitle
}) {
  const base = `transform transition-all duration-700 ease-out opacity-0 translate-y-6`;
  const active = `opacity-100 translate-y-0`;
  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`${base} ${inView ? active : ""} ${className}`}
      aria-hidden={!inView}
    >
      <div className="p-0 overflow-hidden border rounded-lg shadow-lg border-white/8 bg-gradient-to-b from-white/3 to-white/2">
        <div className="p-5">
          <div className="text-sm font-semibold tracking-wide uppercase text-slate-200/80">
            {title}
          </div>
          {subtitle && (
            <div className="mt-2 text-xs text-white/70">{subtitle}</div>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function BigTile({ color = "bg-indigo-600", title, subtitle }) {
  return (
    <div className="rounded-lg p-6 min-h-[110px] flex flex-col justify-between">
      <div className={`${color} bg-opacity-15 rounded-md p-3 inline-block`}>
        <div className="font-semibold text-white/90">{title}</div>
      </div>
      {subtitle && <div className="mt-3 text-sm text-white/70">{subtitle}</div>}
    </div>
  );
}

export default function Architecture() {
  const rootRef = useRef(null);
  const inView = useInView(rootRef);
  // We will use staggered delays to animate child blocks
  return (
    <section
      id="architecture"
      ref={rootRef}
      className="relative px-6 py-32 overflow-hidden"
    >
      {/* ambient background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-40 w-[560px] h-[560px] bg-indigo-700/10 blur-[120px]" />
        <div className="absolute -right-24 -bottom-48 w-[480px] h-[480px] bg-rose-600/6 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold md:text-4xl">Architecture-first Design</h2>
          <p className="mt-4 text-lg text-white/70">
            LogScope is designed with scalability and clarity in mind — append-only ingestion, streaming pipelines,
            efficient indexing, and future-ready database migrations. The diagram below shows how data flows through
            the platform and which capabilities you get at each layer.
          </p>
        </div>

        {/* main flow */}
        <div className="relative grid items-start gap-8 md:grid-cols-12">
          {/* Left column: data sources */}
          <div className="flex md:col-span-3 md:justify-end">
            <div className="w-full max-w-[280px]">
              <div
                className={`transition-all duration-700 ease-out ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "120ms" }}
              >
                <SmallCard
                  title="Your tools / data"
                  icon={<Server className="w-5 h-5" />}
                >
                  Applications, agents, cloud services, SDKs, and third-party tools.
                </SmallCard>
                <div className="mt-6 text-sm text-white/60">
                  Examples:
                  <ul className="mt-3 space-y-2">
                    <li>• App logs (Node/Python/Java)</li>
                    <li>• Containers & platforms (K8s, Docker)</li>
                    <li>• SaaS & integrations (Databases, Proxies)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Center column: large platform card */}
          <div className="md:col-span-6">
            <CenterLayer inView={inView} delay={160} title="">
              {/* large visual wrapper */}
              <div className="p-4 overflow-hidden border rounded-xl border-white/8 bg-gradient-to-b from-white/4 to-white/2">
                {/* Top: Visualization bar */}
                <div className="flex items-center justify-between px-4 py-4 mb-4 rounded-md bg-slate-800/60 text-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-700/40">
                      <Box className="w-4 h-4 text-slate-200/80" />
                    </div>
                    <div className="font-semibold">Visualization</div>
                  </div>
                  <div className="text-sm text-white/60">Dashboards & charts</div>
                </div>

                {/* Middle: three colored solution tiles */}
                <div className="grid gap-3 mb-3 md:grid-cols-3">
                  <div className="p-4 border rounded-lg bg-violet-600/10 border-violet-400/8">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded w-9 h-9 bg-violet-500/10">
                        <Zap className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white/90">Testing</div>
                        <div className="text-sm text-white/70">Pre-prod traces & replay</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-sky-600/10 border-sky-400/8">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded w-9 h-9 bg-sky-500/10">
                        <Layers className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white/90">Observability solutions</div>
                        <div className="text-sm text-white/70">Real-time search & tracing</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-emerald-600/10 border-emerald-400/8">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded w-9 h-9 bg-emerald-500/10">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white/90">Incident response management</div>
                        <div className="text-sm text-white/70">Alerts & runbooks</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key capabilities */}
                <div className="p-4 mb-3 border rounded-md bg-orange-500/10 border-orange-400/10">
                  <div className="font-semibold text-white/90">Key capabilities</div>
                  <div className="mt-2 text-sm text-white/70">
                    Fast filters, structured metadata, retention & lifecycle, RBAC & secure multitenancy.
                  </div>
                </div>

                {/* Building blocks */}
                <div className="p-4 border rounded-md bg-yellow-500/10 border-yellow-400/10">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white/90">Building blocks: telemetry & storage</div>
                    <div className="text-sm text-white/70">LTS & scalable indexes</div>
                  </div>
                </div>
              </div>
            </CenterLayer>
          </div>

          {/* Right column: outcomes / no-lock-in */}
          <div className="md:col-span-3">
            <div
              className={`transition-all duration-700 ease-out ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <SmallCard
                title="Your environment"
                icon={<Database className="w-5 h-5" />}
              >
                Instrumentation, backend services and infra that send logs.
              </SmallCard>

              <div className="mt-6">
                <SmallCard
                  title="No lock-in"
                  icon={<Github className="w-5 h-5" />}
                >
                  Open standards (OTel, Prometheus). Exportable pipelines & APIs.
                </SmallCard>

                <div className="mt-6">
                  <SmallCard
                    title="Outcomes"
                    icon={<ArrowRightCircle className="w-5 h-5" />}
                  >
                    Faster triage, fewer incidents, and data-driven retrospectives.
                  </SmallCard>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm transition bg-indigo-600 rounded-lg hover:bg-indigo-500"
                >
                  Get started
                </Link>
                <Link
                  to="/docs"
                  className="px-3 py-3 ml-3 text-sm transition rounded-lg bg-white/5 hover:bg-white/10"
                >
                  Read docs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* small legend / note */}
        <div className="mt-12 text-sm text-center text-white/60">
          Flow: from left (data sources) to right (outcomes). Click “Read docs” for architecture details & diagrams.
        </div>
      </div>
    </section>
  );
}
