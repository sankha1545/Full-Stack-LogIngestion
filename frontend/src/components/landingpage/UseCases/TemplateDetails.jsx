// src/components/landingpage/UseCases/TemplateDetails.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { TEMPLATES } from "@/data/templates";
import { useEffect } from "react";
import { Play, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = TEMPLATES.find((t) => t.id === id);

  useEffect(() => {
    if (!template) {
      // nothing special — handled in render
    }
  }, [template]);

  if (!template) {
    return (
      <div className="px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold">Template not found</h2>
        <Link to="/templates" className="inline-block mt-4 text-indigo-600">
          Back to templates
        </Link>
      </div>
    );
  }

  const handleLaunch = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // preserve redirect after login
      navigate("/login", { state: { from: `/templates/${id}` } });
      return;
    }
    // insert real launch flow (API call) here
    // navigate to a UI that configures/imports the template
    navigate("/dashboard");
  };

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl px-6 py-24 mx-auto">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold">{template.title}</h1>
          <p className="mt-3 text-slate-600">{template.description}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {template.stack.map((s) => (
              <span key={s} className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-800">
                {s}
              </span>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={handleLaunch} className="inline-flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-500">
              <Play className="w-4 h-4" /> Launch template
            </button>

            <Link to={`/templates/${id}/docs`} className="inline-flex items-center gap-2 px-4 py-2 border rounded-md border-slate-200 text-slate-700 hover:bg-slate-50">
              <BookOpen className="w-4 h-4" /> View documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Short preview / example snippet */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold">Quick example</h3>
        <pre className="p-4 mt-3 overflow-auto text-sm rounded-md bg-slate-900 text-slate-50">
          {template.docs.example_snippet}
        </pre>
      </div>
    </motion.section>
  );
}
