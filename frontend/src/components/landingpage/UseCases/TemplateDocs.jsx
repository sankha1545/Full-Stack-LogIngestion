// src/components/landingpage/UseCases/TemplateDocs.jsx
import { useParams, useNavigate } from "react-router-dom";
import { TEMPLATES } from "@/data/templates";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Download, Copy, ArrowLeft } from "lucide-react";

/**
 * TemplateDocs.jsx
 * - left nav with sections
 * - right content area with anchor sections
 * - code copy and download markdown
 */

function SectionHeading({ children }) {
  return <h3 className="mt-6 text-lg font-semibold">{children}</h3>;
}

function smallCopy(text) {
  return navigator.clipboard?.writeText(text).catch(() => null);
}

export default function TemplateDocs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = TEMPLATES.find((t) => t.id === id);
  const contentRef = useRef(null);

  if (!template) {
    return (
      <div className="px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold">Template not found</h2>
      </div>
    );
  }

  const docs = template.docs;

  const generateMarkdown = () => {
    let md = `# ${template.title}\n\n${docs.overview}\n\n`;
    md += `## Use Cases\n\n`;
    docs.use_cases.forEach((u) => { md += `- ${u}\n`; });
    md += `\n## Features\n\n`;
    docs.features.forEach((f) => { md += `- ${f}\n`; });
    md += `\n## Methodology\n\n`;
    docs.methodology.forEach((m) => {
      md += `### ${m.title}\n\n${m.body}\n\n`;
    });
    md += `## Setup\n\n`;
    docs.setup.forEach((s, i) => { md += `${i+1}. ${s}\n`; });
    md += `\n## Example\n\n\`\`\`\n${docs.example_snippet}\n\`\`\`\n\n`;
    if (docs.references?.length) {
      md += `## References\n\n`;
      docs.references.forEach((r) => { md += `- [${r.label}](${r.url})\n`; });
    }
    return md;
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}-docs.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 py-24 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-700 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="mt-2 text-3xl font-bold">{template.title} — Documentation</h1>
          <p className="max-w-2xl mt-2 text-slate-600">{docs.overview}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { smallCopy(generateMarkdown()); }}
            title="Copy markdown"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>

          <button
            onClick={handleDownload}
            title="Download markdown"
            className="inline-flex items-center gap-2 px-3 py-2 text-white bg-indigo-600 rounded-md"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left nav */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky p-4 space-y-3 border rounded-lg shadow-sm top-24 bg-white/60">
            <div className="text-sm font-medium text-slate-700">Contents</div>
            <nav className="flex flex-col gap-2 mt-2 text-sm">
              <a href="#use-cases" className="text-slate-600 hover:text-slate-900">Use cases</a>
              <a href="#features" className="text-slate-600 hover:text-slate-900">Features</a>
              <a href="#methodology" className="text-slate-600 hover:text-slate-900">Methodology</a>
              <a href="#setup" className="text-slate-600 hover:text-slate-900">Setup</a>
              <a href="#example" className="text-slate-600 hover:text-slate-900">Example</a>
              {docs.references?.length ? <a href="#references" className="text-slate-600 hover:text-slate-900">References</a> : null}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <article ref={contentRef} className="col-span-12 prose lg:col-span-8 prose-slate max-w-none">
          <section id="use-cases">
            <SectionHeading>Use cases</SectionHeading>
            <ul className="ml-6 list-disc">
              {docs.use_cases.map((u, i) => <li key={i} className="mt-1">{u}</li>)}
            </ul>
          </section>

          <section id="features">
            <SectionHeading>Features</SectionHeading>
            <ul className="ml-6 list-disc">
              {docs.features.map((f, i) => <li key={i} className="mt-1">{f}</li>)}
            </ul>
          </section>

          <section id="methodology">
            <SectionHeading>Methodology</SectionHeading>
            {docs.methodology.map((m, idx) => (
              <div key={idx} className="mt-4">
                <h4 className="font-semibold">{m.title}</h4>
                <p className="mt-2 text-slate-700">{m.body}</p>
              </div>
            ))}
          </section>

          <section id="setup">
            <SectionHeading>Setup</SectionHeading>
            <ol className="ml-6 list-decimal">
              {docs.setup.map((s, i) => <li key={i} className="mt-2">{s}</li>)}
            </ol>
          </section>

          <section id="example">
            <SectionHeading>Example</SectionHeading>
            <div className="relative mt-3">
              <pre className="p-4 overflow-auto text-sm rounded-md bg-slate-900 text-slate-50">
                {docs.example_snippet}
              </pre>
              <div className="flex gap-2 mt-2">
                <button onClick={() => smallCopy(docs.example_snippet)} className="px-3 py-1 text-sm border rounded-md">Copy</button>
                <button onClick={() => alert("Run this snippet in your environment.")} className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md">Run locally</button>
              </div>
            </div>
          </section>

          {docs.references?.length ? (
            <section id="references">
              <SectionHeading>References</SectionHeading>
              <ul className="ml-6 list-disc">
                {docs.references.map((r, i) => (
                  <li key={i} className="mt-1">
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-indigo-600">{r.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </div>
    </motion.div>
  );
}
