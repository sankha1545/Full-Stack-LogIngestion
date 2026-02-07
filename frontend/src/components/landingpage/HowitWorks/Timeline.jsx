// src/components/landingpage/HowitWorks/Timeline.jsx
import { useEffect, useRef, useState } from "react";
import { Send, Database, Search } from "lucide-react";

/**
 * Timeline — left column for desktop
 * - Simple reveal-on-scroll; re-usable for other lists
 */

const ICONS = { Send, Database, Search };

export default function Timeline({ steps = [] }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-8">
      {steps.map((s, idx) => {
        const Icon = ICONS[Object.keys(ICONS)[idx % 3]]; // rotate icons
        return (
          <div key={s.id} className="flex items-start gap-4">
            <div
              aria-hidden
              className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all
                ${visible ? "bg-indigo-600/20 ring-1 ring-indigo-500/40 text-indigo-400" : "bg-white/5 text-white/60"}
              `}
              style={{ transitionDelay: `${120 + idx * 80}ms` }}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                {idx + 1}. {s.title}
              </div>
              <div className="mt-1 text-sm text-white/70 max-w-[220px]">
                {s.desc.length > 60 ? s.desc.slice(0, 60) + "…" : s.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
