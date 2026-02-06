import {
  Zap,
  Filter,
  BarChart3,
  Shield,
  Clock,
  Layers
} from "lucide-react";

const FEATURES = [
  {
    title: "Real-time ingestion",
    description:
      "Stream logs as they are generated with ultra-low latency pipelines.",
    icon: Zap
  },
  {
    title: "Advanced filtering",
    description:
      "Slice logs by level, service, traceId, timestamp, and metadata.",
    icon: Filter
  },
  {
    title: "Built for scale",
    description:
      "Designed to handle millions of events without slowing down.",
    icon: Layers
  },
  {
    title: "Fast querying",
    description:
      "Search large log volumes instantly with optimized indexing.",
    icon: Clock
  },
  {
    title: "Actionable insights",
    description:
      "Visualize trends and error patterns to debug faster.",
    icon: BarChart3
  },
  {
    title: "Secure by default",
    description:
      "Role-based access and isolated log streams for each team.",
    icon: Shield
  }
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative px-6 py-32 overflow-hidden"
    >
      {/* Background separation */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section header */}
        <div className="max-w-3xl mx-auto mb-20 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Everything you need to understand your logs
          </h2>
          <p className="mt-4 text-lg text-white/70">
            LogScope gives engineering teams clarity, speed, and control
            across their entire logging pipeline.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="
                  group relative rounded-2xl border border-white/10
                  bg-white/5 p-6
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-white/10
                  hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]
                "
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 mb-6 text-indigo-400 transition  rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/30 group-hover:bg-indigo-500/20">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="leading-relaxed text-white/70">
                  {feature.description}
                </p>

                {/* Hover accent */}
                <span className="absolute inset-x-0 bottom-0 h-px transition opacity-0 pointer-events-none  bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
