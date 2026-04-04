import { Zap, Filter, BarChart3, Shield, Clock, Layers } from "lucide-react";

const FEATURES = [
  {
    title: "Live ingestion",
    description: "Stream logs instantly from applications and services with a cleaner live pipeline experience.",
    icon: Zap,
  },
  {
    title: "Powerful filtering",
    description: "Search by level, service, trace, resource, and metadata without losing context.",
    icon: Filter,
  },
  {
    title: "Scalable architecture",
    description: "Designed for high-volume systems with a UI that still feels lightweight and fast.",
    icon: Layers,
  },
  {
    title: "Faster investigation",
    description: "Move from alert to root cause with tighter hierarchy, clearer states, and better detail views.",
    icon: Clock,
  },
  {
    title: "Animated analytics",
    description: "See severity trends and event patterns in polished visualizations that are easier to read.",
    icon: BarChart3,
  },
  {
    title: "Secure by default",
    description: "Keep teams isolated with role-aware access and safer application credential workflows.",
    icon: Shield,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-sm text-sky-200">
            Product strengths
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            A more standard, user-friendly observability experience from first click to investigation.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            The landing experience now mirrors the product direction: clearer hierarchy, cleaner cards, and stronger guidance for the user journey.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-[28px] border border-white/10 bg-white/[0.05] p-7 transition duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-white/[0.08] hover:shadow-[0_20px_70px_rgba(14,165,233,0.08)]"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/16 to-blue-500/10 ring-1 ring-sky-400/20">
                  <Icon className="h-6 w-6 text-sky-300" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
