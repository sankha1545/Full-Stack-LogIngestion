import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BellRing,
  BookOpen,
  Boxes,
  Cable,
  ChevronRight,
  FileCode2,
  KeyRound,
  LineChart,
  Search,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick Start" },
  { id: "applications", label: "Applications" },
  { id: "ingestion", label: "Send Logs" },
  { id: "live-logs", label: "Live Logs" },
  { id: "analytics", label: "Analytics" },
  { id: "alerts", label: "Alerts" },
  { id: "api", label: "API Basics" },
];

function Section({ id, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <Card className="rounded-[24px] border-slate-200 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="inline-flex rounded-2xl bg-sky-50 p-3 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
    </Card>
  );
}

function CodeBlock({ title, code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy code example", error);
    }
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-900">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</div>
        <button onClick={handleCopy} className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-slate-950 p-4 text-sm leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StepList({ steps }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-sky-500 dark:text-slate-950">
            {index + 1}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState(SECTIONS[0].id);

  const handleNavClick = useCallback((event, id) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActive(visible[0].target.id);
      },
      { threshold: [0.2, 0.4, 0.6] }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              Back to site
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">LogScope Documentation</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signup">
              <Button variant="outline" className="rounded-2xl">Create account</Button>
            </Link>
            <Link to="/contact">
              <Button className="rounded-2xl">Contact sales</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Documentation</div>
            <nav className="mt-4 space-y-1.5">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => handleNavClick(event, section.id)}
                  className={`flex items-center justify-between rounded-xl border-l-2 px-3 py-2.5 text-sm transition ${
                    active === section.id
                      ? "border-sky-500 bg-sky-50 text-slate-950 dark:bg-slate-900 dark:text-slate-50"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900/80 dark:hover:text-slate-100"
                  }`}
                >
                  <span>{section.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              ))}
            </nav>
            <Separator className="my-5" />
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              This guide is written for product users first. Start with Quick Start if you are setting up LogScope for the first time.
            </p>
          </div>
        </aside>

        <div className="space-y-8">
          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-slate-800">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
              <BookOpen className="h-3.5 w-3.5" />
              Product guide
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything a user needs to start sending logs, viewing them live, and understanding the platform.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              This page explains the product in a simple order: what LogScope does, how to set it up, how to connect an application, how to read logs, and where to look when you need alerts or analytics.
            </p>
          </section>

          <Section
            id="overview"
            title="Overview"
            description="LogScope is used to collect logs from applications and make them easy to search, inspect, and monitor from one place."
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard icon={Boxes} title="Applications" text="Create applications, manage credentials, and keep each log stream separated by application." />
              <InfoCard icon={TerminalSquare} title="Live logs" text="Watch logs appear in real time while your connected service is running." />
              <InfoCard icon={LineChart} title="Analytics" text="Understand volume, severity, and activity trends through charts and summary cards." />
              <InfoCard icon={ShieldCheck} title="Security" text="Use authentication, MFA, access control, and API key rotation to protect the workspace." />
            </div>
          </Section>

          <Section
            id="quick-start"
            title="Quick Start"
            description="If you are new to LogScope, follow these steps in order."
          >
            <StepList
              steps={[
                {
                  title: "Create an account and sign in",
                  text: "Use the signup or login flow to access the workspace. If MFA is enabled for your account, complete the verification step before entering the dashboard.",
                },
                {
                  title: "Create an application",
                  text: "Open the Applications page, add a new application, and save the API key or connection string shown to you. The key is only shown once.",
                },
                {
                  title: "Send logs from your service",
                  text: "Use the generated credentials with the ingestion endpoint so your application can start sending structured logs into LogScope.",
                },
                {
                  title: "Open the live log view",
                  text: "Go to the application detail page to see logs stream in live, filter them, and open detailed metadata for each event.",
                },
              ]}
            />
          </Section>

          <Section
            id="applications"
            title="Applications"
            description="Applications are the main container for logs inside LogScope. Each application has its own credentials and live log workspace."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex rounded-2xl bg-white p-3 text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-300 dark:shadow-none">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Credentials</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Each application gets an API key and connection details for ingestion. You can rotate keys later if you need to replace or revoke access.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex rounded-2xl bg-white p-3 text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-300 dark:shadow-none">
                  <Cable className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Connection model</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Logs are always associated with one application. This makes searching, permissions, and live streaming easier to understand and safer to manage.
                </p>
              </div>
            </div>
          </Section>

          <Section
            id="ingestion"
            title="Send Logs"
            description="After creating an application, send structured log events to the LogScope ingestion endpoint."
          >
            <CodeBlock
              title="POST /api/logs/ingest"
              code={`curl -X POST "http://localhost:3001/api/logs/ingest?key=<API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "error",
    "message": "Database connection failed",
    "timestamp": "2026-04-04T10:15:00.000Z",
    "resourceId": "auth-service",
    "traceId": "trace-123",
    "spanId": "span-456",
    "service": "api",
    "environment": "production",
    "host": "node-1",
    "version": "1.4.2",
    "tags": ["payments", "critical"],
    "metadata": { "region": "ap-south-1" }
  }'`}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard icon={FileCode2} title="Structured fields" text="Send consistent fields like level, message, timestamp, service, environment, host, version, and metadata for better filtering." />
              <InfoCard icon={Search} title="Search quality" text="The cleaner and more consistent your log messages and metadata are, the easier they are to search later." />
              <InfoCard icon={ShieldCheck} title="Credential safety" text="Store ingestion keys securely in your application environment. Do not hardcode them into public client-side code." />
            </div>
          </Section>

          <Section
            id="live-logs"
            title="Live Logs"
            description="The application detail page is where you monitor a connected service in real time."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">What you can do</h3>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  <li>Watch new logs arrive without refreshing the page.</li>
                  <li>Filter by level, text, resource, service, trace, and date range.</li>
                  <li>Open a log row to inspect full metadata.</li>
                  <li>Use the terminal-style live tail for quick monitoring.</li>
                </ul>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Best practices</h3>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  <li>Use error and fatal levels consistently so incidents stand out.</li>
                  <li>Include trace identifiers when possible for request-level debugging.</li>
                  <li>Add meaningful metadata instead of putting everything into the message text.</li>
                  <li>Use application-specific naming to keep multiple services easy to distinguish.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section
            id="analytics"
            title="Analytics"
            description="The Analytics page helps you understand log activity over time for a selected application."
          >
            <div className="grid gap-6 md:grid-cols-3">
              <InfoCard icon={Activity} title="Volume trends" text="Track how many logs are being generated and spot spikes or sudden drops in activity." />
              <InfoCard icon={LineChart} title="Severity mix" text="Compare the balance of info, warning, error, fatal, and debug logs in one view." />
              <InfoCard icon={Search} title="Event patterns" text="Use analytics to identify the kinds of events your services produce most often." />
            </div>
          </Section>

          <Section
            id="alerts"
            title="Alerts"
            description="Alerts help you react when important log conditions are met."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="inline-flex rounded-2xl bg-white p-3 text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-300 dark:shadow-none">
                  <BellRing className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Common alert examples</h3>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  <li>Error count crosses a threshold in a short time window.</li>
                  <li>A critical service starts emitting fatal logs.</li>
                  <li>A specific query or pattern appears repeatedly.</li>
                </ul>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">How to think about alerts</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Good alerts are specific, actionable, and tied to real service health. Start with error-rate or fatal-log alerts before creating more advanced rules.
                </p>
              </div>
            </div>
          </Section>

          <Section
            id="api"
            title="API Basics"
            description="These are the main API actions most users and integrators need to know."
          >
            <div className="overflow-x-auto rounded-[24px] border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">Endpoint</th>
                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">Method</th>
                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">/api/apps</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">POST</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">Create an application and get its ingestion credentials.</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">/api/logs/ingest</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">POST</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">Send one or more logs into LogScope.</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">/api/logs</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">GET</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">Read and filter logs for a selected application.</td>
                  </tr>
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">/socket.io</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">WebSocket</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">Streams new log events into the live application view.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
