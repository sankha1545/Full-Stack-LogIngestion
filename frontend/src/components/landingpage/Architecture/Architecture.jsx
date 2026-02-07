import { useEffect, useRef, useState } from "react";
import {
  Server,
  Database,
  Layers,
  Sliders,
  Box,
  ArrowRightCircle,
  Github,
  Zap,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Architecture.jsx
 *
 * Responsive, animated architecture overview.
 * - Left: data sources
 * - Center: platform layers
 * - Right: outcomes & guarantees
 *
 * CTA: Read docs → /architecture/docs
 */

function useInView(ref, options = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // animate once
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return inView;
}

function SmallCard({ title, children, icon }) {
  return (
    <div className="p-4 border rounded-xl bg-white/5 border-white/10">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 text-indigo-400 rounded bg-indigo-600/10 ring-1 ring-indigo-500/30">
            {icon}
          </div>
        )}
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm text-white/70">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CenterLayer({ inView, delay, children }) {
  return (
    <div
      className={`transition-all duration-700 ease-out transform ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Architecture() {
  const rootRef = useRef(null);
  const inView = useInView(rootRef);

  return (
    <section
      id="architecture"
      ref={rootRef}
      className="relative px-6 py-32 overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-40 w-[560px] h-[560px] bg-indigo-700/10 blur-[120px]" />
        <div className="absolute -right-24 -bottom-48 w-[480px] h-[480px] bg-rose-600/6 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold md:text-4xl">
            Architecture-first Design
          </h2>
          <p className="mt-4 text-lg text-white/70">
            LogScope is built for scalable ingestion, real-time processing,
            efficient indexing, and long-term retention — without locking you in.
          </p>
        </div>

        {/* Layout */}
        <div className="grid items-start gap-8 md:grid-cols-12">
          {/* Left */}
          <div className="md:col-span-3">
            <CenterLayer inView={inView} delay={120}>
              <SmallCard
                title="Your tools & data"
                icon={<Server className="w-5 h-5" />}
              >
                Applications, containers, cloud services, SDKs, and agents that
                emit logs, traces, and metrics.
              </SmallCard>

              <ul className="mt-4 ml-4 text-sm list-disc text-white/60">
                <li>Application logs (Node, Python, Java)</li>
                <li>Containers & platforms (Docker, Kubernetes)</li>
                <li>Infra & SaaS systems</li>
              </ul>
            </CenterLayer>
          </div>

          {/* Center */}
          <div className="md:col-span-6">
            <CenterLayer inView={inView} delay={160}>
              <div className="p-4 border rounded-xl bg-white/5 border-white/10">
                {/* Visualization */}
                <div className="flex items-center justify-between p-4 mb-4 rounded bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-700/40">
                      <Box className="w-4 h-4" />
                    </div>
                    <div className="font-semibold">Visualization</div>
                  </div>
                  <div className="text-sm text-white/60">
                    Dashboards & charts
                  </div>
                </div>

                {/* Solutions */}
                <div className="grid gap-3 md:grid-cols-3">
                  <SmallCard
                    title="Testing"
                    icon={<Zap className="w-4 h-4" />}
                  >
                    Pre-production traces and replay
                  </SmallCard>

                  <SmallCard
                    title="Observability"
                    icon={<Layers className="w-4 h-4" />}
                  >
                    Real-time search and tracing
                  </SmallCard>

                  <SmallCard
                    title="Incident response"
                    icon={<Sliders className="w-4 h-4" />}
                  >
                    Alerts, on-call & runbooks
                  </SmallCard>
                </div>

                <div className="p-4 mt-4 border rounded bg-orange-500/10 border-orange-400/10">
                  <div className="font-semibold">Key capabilities</div>
                  <div className="mt-1 text-sm text-white/70">
                    Fast queries, structured metadata, retention policies, RBAC,
                    secure multi-tenancy.
                  </div>
                </div>
              </div>
            </CenterLayer>
          </div>

          {/* Right */}
          <div className="md:col-span-3">
            <CenterLayer inView={inView} delay={200}>
              <SmallCard
                title="Your environment"
                icon={<Database className="w-5 h-5" />}
              >
                Backend services and infrastructure where telemetry originates.
              </SmallCard>

              <div className="mt-6">
                <SmallCard
                  title="No lock-in"
                  icon={<Github className="w-5 h-5" />}
                >
                  Open standards (OTel, Prometheus) and exportable pipelines.
                </SmallCard>
              </div>

              <div className="mt-6">
                <SmallCard
                  title="Outcomes"
                  icon={<ArrowRightCircle className="w-5 h-5" />}
                >
                  Faster triage, fewer outages, data-driven retrospectives.
                </SmallCard>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 mt-6">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-3 text-sm font-medium bg-indigo-600 rounded-lg hover:bg-indigo-500"
                >
                  Get started
                </Link>

                {/* ✅ FIXED LINK */}
                <Link
                  to="/architecture/docs"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <BookOpen className="w-4 h-4" />
                  Read docs
                </Link>
              </div>
            </CenterLayer>
          </div>
        </div>

        <div className="mt-12 text-sm text-center text-white/60">
          Flow: left → right. Click “Read docs” for a detailed explanation of
          LogScope’s architecture.
        </div>
      </div>
    </section>
  );
}
