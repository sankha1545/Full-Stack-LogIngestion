// src/components/landingpage/HowitWorks/StepCard.jsx
import { useEffect, useRef, useState } from "react";
import { Send, Database, Search } from "lucide-react";

/**
 * StepCard — small card component for each step
 * Props: index, title, description
 */

const ICONS = [Send, Database, Search];

export default function StepCard({ index = 0, title, description }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

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

  const Icon = ICONS[index % ICONS.length];

  return (
    <article
      ref={ref}
      className={`rounded-2xl p-6 border border-white/8 bg-white/5 transform transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${100 + index * 80}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 text-indigo-400 rounded-lg bg-indigo-600/10 ring-1 ring-indigo-500/30">
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-white/70">{description}</p>
        </div>
      </div>
    </article>
  );
}
