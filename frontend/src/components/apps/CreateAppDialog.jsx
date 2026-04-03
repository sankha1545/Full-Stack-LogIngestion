"use client";

import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";
import { CheckCircle2, Globe2, Layers3, Loader2, Rocket } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApp } from "@/api/appsApi";

const FRAMEWORKS = ["Next.js", "React", "Node.js", "Express", "Django", "Spring Boot"];
const REGIONS = [
  { value: "us-east-1", label: "US East" },
  { value: "eu-west-1", label: "Europe" },
  { value: "ap-south-1", label: "India" },
];
const ENVIRONMENTS = ["DEVELOPMENT", "STAGING", "PRODUCTION"];

export default function CreateAppDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    environment: "PRODUCTION",
    framework: "Next.js",
    region: "us-east-1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({
      name: "",
      slug: "",
      description: "",
      environment: "PRODUCTION",
      framework: "Next.js",
      region: "us-east-1",
    });
    setError("");
  }, [open]);

  useEffect(() => {
    if (!form.name) return;
    setForm((prev) => ({
      ...prev,
      slug: slugify(form.name, { lower: true, strict: true }),
    }));
  }, [form.name]);

  const readiness = useMemo(() => {
    const checklist = [
      Boolean(form.name.trim()),
      Boolean(form.environment),
      Boolean(form.framework),
      Boolean(form.region),
    ];
    return checklist.filter(Boolean).length;
  }, [form]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setError("Application name required");
      return;
    }

    try {
      setLoading(true);
      const res = await createApp(form);
      onCreated?.(res.data);
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to create application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-4xl">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          <div className="bg-slate-950 p-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              <Rocket className="h-3.5 w-3.5" />
              New application
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">Set up a polished, production-ready monitoring workspace.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              This flow has been redesigned to feel clearer and more standard. It guides users through the core setup details,
              previews the generated slug, and gives confidence before creation.
            </p>

            <div className="mt-8 space-y-4">
              <Feature icon={Layers3} title="Better structure" text="Grouped choices and clearer defaults reduce friction during onboarding." />
              <Feature icon={Globe2} title="Deployment context" text="Environment, framework, and region remain visible so teams know what they are creating." />
              <Feature icon={CheckCircle2} title="Setup readiness" text={`Configuration readiness: ${readiness}/4 completed.`} />
            </div>
          </div>

          <div className="p-8">
            <DialogHeader className="space-y-2 p-0">
              <DialogTitle className="text-2xl font-semibold text-slate-950">Create Application</DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-500">
                Add a new application to monitor logs, inspect live streams, and analyze behavior with animated dashboards.
              </DialogDescription>
            </DialogHeader>

            {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Application name" helper="Human-friendly workspace label.">
                <Input
                  placeholder="Smart Bookmark"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="h-11 rounded-xl"
                />
              </Field>

              <Field label="Project slug" helper="Auto-generated identifier.">
                <Input value={form.slug} disabled className="h-11 rounded-xl bg-slate-50" />
              </Field>

              <Field label="Description" helper="Optional but useful for teams.">
                <Input
                  placeholder="Production logging for the bookmark app"
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  className="h-11 rounded-xl"
                />
              </Field>

              <Field label="Environment" helper="Default deployment stage.">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  value={form.environment}
                  onChange={(event) => handleChange("environment", event.target.value)}
                >
                  {ENVIRONMENTS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0) + option.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Framework" helper="Used for setup context.">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  value={form.framework}
                  onChange={(event) => handleChange("framework", event.target.value)}
                >
                  {FRAMEWORKS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Region" helper="Primary hosting region.">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  value={form.region}
                  onChange={(event) => handleChange("region", event.target.value)}
                >
                  {REGIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              After creation, the app credentials dialog will show the one-time API key and connection string.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" className="rounded-2xl" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button className="rounded-2xl px-5" onClick={handleCreate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Application
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, helper, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-900">{label}</Label>
      {children}
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-2.5">
          <Icon className="h-4 w-4 text-sky-200" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm leading-6 text-slate-300">{text}</div>
        </div>
      </div>
    </div>
  );
}

