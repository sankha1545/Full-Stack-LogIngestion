// src/pages/ArchitectureDocs.jsx
import { useRef } from "react";
import { motion } from "framer-motion";
import { ARCH_DOC } from "@/data/archtecture";
import { Download, Copy, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SectionTitle({ children }) {
  return <h3 className="mt-6 text-xl font-semibold">{children}</h3>;
}

function smallCopy(text) {
  return navigator.clipboard?.writeText(text).catch(() => null);
}

export default function ArchitectureDocs() {
  const nav = useNavigate();
  const contentRef = useRef(null);

  const generateMarkdown = () => {
    const d = ARCH_DOC;
    let md = `# ${d.title}\n\n${d.tagline}\n\n## Summary\n\n${d.summary}\n\n## Goals\n`;
    d.goals.forEach((g) => (md += `- ${g}\n`));
    md += `\n## Components\n`;
    d.components.forEach((c) => {
      md += `### ${c.title}\n\n${c.plain}\n\n`;
    });
    md += `\n## Data Flow\n`;
    d.dataFlow.forEach((f) => {
      md += `### ${f.title}\n`;
      f.steps.forEach((s) => {
        md += `- **${s.step}**: ${s.detail}\n`;
      });
    });
    md += `\n## Security\n\n${d.security.overview}\n\n`;
    md += `## Scaling\n\n${d.scaling.overview}\n\n`;
    md += `\n## Contact\n\n${d.contact}\n\n`;
    return md;
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logscope-architecture.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl px-6 py-20 mx-auto">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <button onClick={() => nav(-1)} className="inline-flex items-center gap-2 text-sm text-slate-700 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="mt-3 text-3xl font-bold">{ARCH_DOC.title}</h1>
          <p className="max-w-3xl mt-2 text-slate-600">{ARCH_DOC.tagline}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { smallCopy(generateMarkdown()); }} className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md">
            <Copy className="w-4 h-4" /> Copy
          </button>

          <button onClick={handleDownload} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white bg-indigo-600 rounded-md">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left nav */}
        <aside className="sticky self-start lg:col-span-3 top-24">
          <div className="p-4 border rounded-lg shadow-sm bg-white/60">
            <div className="text-sm font-medium">Contents</div>
            <nav className="flex flex-col gap-2 mt-2 text-sm">
              <a href="#summary" className="text-slate-600 hover:text-slate-900">Summary</a>
              <a href="#goals" className="text-slate-600 hover:text-slate-900">Goals</a>
              <a href="#components" className="text-slate-600 hover:text-slate-900">Components</a>
              <a href="#dataflow" className="text-slate-600 hover:text-slate-900">Data Flow</a>
              <a href="#security" className="text-slate-600 hover:text-slate-900">Security</a>
              <a href="#scaling" className="text-slate-600 hover:text-slate-900">Scaling</a>
              <a href="#faq" className="text-slate-600 hover:text-slate-900">FAQ</a>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article ref={contentRef} className="prose prose-slate lg:col-span-9 max-w-none">
          <section id="summary">
            <h2>Summary</h2>
            <p>{ARCH_DOC.summary}</p>
          </section>

          <section id="goals">
            <SectionTitle>Goals</SectionTitle>
            <ul>
              {ARCH_DOC.goals.map((g, idx) => <li key={idx} className="mt-1">{g}</li>)}
            </ul>
          </section>

          <section id="components">
            <SectionTitle>Components</SectionTitle>
            {ARCH_DOC.components.map((c) => (
              <div key={c.id} className="mt-4">
                <h4 className="font-semibold">{c.title}</h4>
                <p className="mt-2">{c.plain}</p>
                <details className="p-3 mt-2 rounded-md bg-slate-50">
                  <summary className="font-medium cursor-pointer">Technical details (expand)</summary>
                  <div className="mt-2 text-sm text-slate-700">
                    {c.technical}
                  </div>
                </details>
              </div>
            ))}
          </section>

          <section id="dataflow">
            <SectionTitle>Data flow — simple explanation</SectionTitle>
            <p className="mb-4">{ARCH_DOC.dataFlow[0].title}</p>

            {ARCH_DOC.dataFlow[0].steps.map((s, i) => (
              <div key={i} className="mt-4">
                <h5 className="font-semibold">{s.step}</h5>
                <p className="mt-1 text-slate-700">{s.detail}</p>
              </div>
            ))}

            <div className="p-4 mt-6 border rounded-md bg-white/5">
              <div className="font-semibold">Diagram (non-technical)</div>
              <p className="mt-2 text-sm text-slate-600">{ARCH_DOC.diagramNote}</p>

              {/* simple inline svg flow diagram (accessible) */}
              <div className="mt-4">
                <svg width="100%" height="140" viewBox="0 0 900 140" role="img" aria-label="Simplified data flow diagram">
                  <g fill="none" stroke="none">
                    {/* boxes */}
                    <rect x="10" y="20" width="180" height="40" rx="8" fill="#eef2ff" stroke="#c7d2fe" />
                    <text x="100" y="47" fontSize="12" textAnchor="middle" fill="#3730a3">Data sources</text>

                    <rect x="230" y="20" width="180" height="40" rx="8" fill="#ecfeff" stroke="#67e8f9" />
                    <text x="320" y="47" fontSize="12" textAnchor="middle" fill="#035d65">Ingestion gateway</text>

                    <rect x="450" y="20" width="180" height="40" rx="8" fill="#fff7ed" stroke="#fdba74" />
                    <text x="540" y="47" fontSize="12" textAnchor="middle" fill="#92400e">Streaming pipelines</text>

                    <rect x="670" y="20" width="220" height="40" rx="8" fill="#f0fdf4" stroke="#86efac" />
                    <text x="780" y="47" fontSize="12" textAnchor="middle" fill="#065f46">Storage & Index</text>

                    {/* arrows */}
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                      </marker>
                    </defs>

                    <line x1="190" y1="40" x2="230" y2="40" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"></line>
                    <line x1="410" y1="40" x2="450" y2="40" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"></line>
                    <line x1="630" y1="40" x2="670" y2="40" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"></line>
                  </g>
                </svg>
              </div>
            </div>
          </section>

          <section id="security">
            <SectionTitle>Security</SectionTitle>
            <p className="mt-2">{ARCH_DOC.security.overview}</p>
            <ul className="mt-2">
              {ARCH_DOC.security.practices.map((p, i) => <li key={i} className="mt-1">{p}</li>)}
            </ul>
          </section>

          <section id="scaling">
            <SectionTitle>Scaling & resilience</SectionTitle>
            <p className="mt-2">{ARCH_DOC.scaling.overview}</p>
            <ul className="mt-2">
              {ARCH_DOC.scaling.patterns.map((p, i) => <li key={i} className="mt-1">{p}</li>)}
            </ul>
          </section>

          <section id="faq">
            <SectionTitle>FAQ</SectionTitle>
            <div className="mt-2">
              {ARCH_DOC.faq.map((q, idx) => (
                <details key={idx} className="p-3 mt-3 border rounded-md bg-white/5">
                  <summary className="font-medium cursor-pointer">{q.q}</summary>
                  <div className="mt-2 text-slate-700">{q.a}</div>
                </details>
              ))}
            </div>
          </section>

          <section id="contact" className="mt-8">
            <SectionTitle>Contact & next steps</SectionTitle>
            <p className="mt-2">{ARCH_DOC.contact}</p>
          </section>
        </article>
      </div>
    </motion.div>
  );
}
