// src/components/landingpage/HowitWorks/docs/Docs.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function FullSection({ id, title, subtitle, children }) {
  return (
    <section id={id} className="flex items-center min-h-screen py-20 scroll-mt-20">
      <div className="w-full max-w-5xl px-4 mx-auto">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="max-w-3xl mt-3 text-lg text-slate-600">{subtitle}</p>}
        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </section>
  );
}

function Expandable({ title = "Technical details", children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-sm font-medium text-indigo-600 hover:underline" aria-expanded={open}>
        {open ? "▼" : "▶"} {title}
      </button>
      {open && <div className="p-4 mt-3 text-sm border rounded-md bg-slate-50 text-slate-700">{children}</div>}
    </div>
  );
}

function CodeBlock({ title, code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore errors
    }
  };

  return (
    <div className="overflow-hidden border rounded-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100">
        <span className="text-xs font-medium">{title}</span>
        <button onClick={copy} className="text-xs text-indigo-600 hover:underline">{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-slate-900 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav config                                                                  */
/* -------------------------------------------------------------------------- */

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "goals", label: "Goals" },
  { id: "ingestion", label: "Ingestion" },
  { id: "pipelines", label: "Pipelines" },
  { id: "search", label: "Search & Alerts" },
  { id: "security", label: "Security" },
  { id: "api", label: "API" },
];

/* -------------------------------------------------------------------------- */
/* Main Docs Page                                                              */
/* -------------------------------------------------------------------------- */

export default function Docs() {
  const [active, setActive] = useState(SECTIONS[0].id);

  const onNavClick = useCallback((e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // update URL hash without jumping
    history.replaceState(null, "", `#${id}`);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry with largest intersectionRatio
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActive(visible[0].target.id);
        } else {
          // fallback: nearest to top
          let nearest = SECTIONS[0].id;
          let minTop = Infinity;
          SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (!el) return;
            const top = Math.abs(el.getBoundingClientRect().top);
            if (top < minTop) {
              minTop = top;
              nearest = s.id;
            }
          });
          setActive(nearest);
        }
      },
      { threshold: [0.3, 0.5, 0.75] }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /* Utility: table row generator for processors */
  const PipelineProcessorsTable = () => (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left">Processor</th>
            <th className="p-3 text-left">Purpose</th>
            <th className="p-3 text-left">When to use</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3 font-medium">json_decode</td>
            <td className="p-3">Parse JSON payload into fields</td>
            <td className="p-3 text-slate-600">Use if messages contain embedded JSON</td>
          </tr>
          <tr className="bg-white border-t">
            <td className="p-3 font-medium">label_extractor</td>
            <td className="p-3">Extract service/region/environment</td>
            <td className="p-3 text-slate-600">To create indexed labels for queries</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-medium">scrub</td>
            <td className="p-3">PII redaction (emails, ssn)</td>
            <td className="p-3 text-slate-600">Compliance-sensitive pipelines</td>
          </tr>
          <tr className="bg-white border-t">
            <td className="p-3 font-medium">sample</td>
            <td className="p-3">Reduce volume using deterministic sampling</td>
            <td className="p-3 text-slate-600">High-volume flows (metrics, debug logs)</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-medium">enrich_geoip</td>
            <td className="p-3">Add country/ASN information</td>
            <td className="p-3 text-slate-600">When IP-based analytics are needed</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const IngestionMethodsTable = () => (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left">Method</th>
            <th className="p-3 text-left">Pros</th>
            <th className="p-3 text-left">Cons</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3 font-medium">SDK (Node/Python/Go)</td>
            <td className="p-3 text-slate-600">Structured, batching, retries</td>
            <td className="p-3 text-slate-600">Requires library updates</td>
          </tr>
          <tr className="bg-white border-t">
            <td className="p-3 font-medium">OTLP (OpenTelemetry)</td>
            <td className="p-3 text-slate-600">Unified telemetry (traces/metrics/logs)</td>
            <td className="p-3 text-slate-600">gRPC complexity; exporter config needed</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-medium">Agent (Fluent Bit)</td>
            <td className="p-3 text-slate-600">Host-level collection, low effort</td>
            <td className="p-3 text-slate-600">Less structured than SDKs</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const AlertsTable = () => (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left">Alert Type</th>
            <th className="p-3 text-left">Trigger</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3 font-medium">Error spike</td>
            <td className="p-3 text-slate-600">Error rate &gt; 5% (1m window)</td>
            <td className="p-3 text-slate-600">Send Slack + create incident</td>
          </tr>
          <tr className="bg-white border-t">
            <td className="p-3 font-medium">Index lag</td>
            <td className="p-3 text-slate-600">Ingest queue depth &gt; threshold</td>
            <td className="p-3 text-slate-600">Scale pipeline workers</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const ApiEndpointsTable = () => (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left">Endpoint</th>
            <th className="p-3 text-left">Method</th>
            <th className="p-3 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3 font-medium">/v1/workspaces/&lt;id&gt;/events</td>
            <td className="p-3">POST</td>
            <td className="p-3 text-slate-600">Ingest a single event or a batch of events</td>
          </tr>
          <tr className="bg-white border-t">
            <td className="p-3 font-medium">/v1/query</td>
            <td className="p-3">POST</td>
            <td className="p-3 text-slate-600">Run search queries and aggregations</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-medium">/v1/keys</td>
            <td className="p-3">GET/POST/DELETE</td>
            <td className="p-3 text-slate-600">Manage API keys for a workspace</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="relative">
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="flex items-center justify-between px-6 py-3 mx-auto max-w-7xl">
          <Link to="/" className="text-sm text-slate-600 hover:underline">← Back</Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Copy</Button>
            <Button size="sm">Download</Button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] border-r bg-slate-50">
          <nav className="p-6 space-y-4">
            <h3 className="mb-3 text-xs tracking-wide uppercase text-slate-500">Contents</h3>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => onNavClick(e, s.id)}
                className={`block px-3 py-2 rounded text-sm transition ${active === s.id ? "bg-indigo-100 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {s.label}
              </a>
            ))}

            <Separator className="my-4" />
            <div className="text-xs text-slate-600">
              Pro tip: click an item to jump. Sections are intentionally large so each topic reads like a chapter.
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div>
          {/* Summary */}
          <FullSection id="summary" title="LogScope Architecture Overview" subtitle="How LogScope ingests, processes, indexes, and serves observability data at scale.">
            <p className="text-slate-700">
              LogScope ingests telemetric events (logs, traces, metrics) from applications, containers, and infrastructure.
              Events are normalized, enriched, optionally redacted, and stored in a combination of low-latency indexes and long-term object storage.
              This design balances fast, interactive queries for recent data with cost-effective archival for historical analysis.
            </p>

            <Card className="p-6">
              <h4 className="mb-2 font-semibold">Architecture in one paragraph</h4>
              <p className="text-slate-600">
                Clients &amp; agents &rarr; Ingest gateway (auth, validation) &rarr; Stream pipelines (enrich, redact, sample) &rarr; Indexers (hot path) &rarr; Long-term storage (S3). Observability and SLO metrics are exported to Prometheus/Grafana for operational monitoring.
              </p>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h5 className="font-semibold">When to use LogScope</h5>
                <ul className="mt-2 space-y-1 list-disc list-inside text-slate-700">
                  <li>High-volume centralized logging for microservices.</li>
                  <li>Incident investigation with traces and logs correlated.</li>
                  <li>PII-aware pipelines with redaction policy support.</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold">Quick numbers (example)</h5>
                <table className="w-full mt-3 overflow-hidden text-sm border rounded-md">
                  <tbody>
                    <tr className="bg-slate-50"><td className="p-2 font-medium">Ingest throughput</td><td className="p-2">500k events/s (cluster)</td></tr>
                    <tr><td className="p-2 font-medium">Query latency</td><td className="p-2">&lt; 500ms (hot data)</td></tr>
                    <tr className="bg-slate-50"><td className="p-2 font-medium">Retention</td><td className="p-2">Days → Months (hot → warm → cold)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FullSection>

          {/* Goals */}
          <FullSection id="goals" title="Design Goals" subtitle="The principles that guided system choices.">
            <div className="space-y-4 text-slate-700">
              <p>
                The system is designed for operational resilience: graceful degradation, predictable scaling, and clear cost tradeoffs.
                Teams should be able to run both small self-hosted clusters and larger cloud deployments with the same architecture.
              </p>

              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Durability:</strong> append-only ingestion and durable checkpoints for replay.</li>
                <li><strong>Scalability:</strong> partitioned ingestion and shardable indexes for parallelism.</li>
                <li><strong>Observability:</strong> SLOs, metrics, and tracing for all pipeline stages.</li>
                <li><strong>Security & Compliance:</strong> field-level scrubbing, RBAC, and retention policies.</li>
              </ul>
            </div>
          </FullSection>

          {/* Ingestion */}
          <FullSection id="ingestion" title="Log Ingestion" subtitle="A deep look at how events arrive and are validated.">
            <p className="text-slate-700">
              Ingest methods: SDKs (application-level), OTLP exporters (OpenTelemetry), and agents (Fluent Bit/Fluentd) for host & container logs.
              Each method offers different tradeoffs between structure, reliability, and operational convenience.
            </p>

            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-semibold">Comparison of ingestion methods</h4>
              <IngestionMethodsTable />
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="font-medium">SDK (recommended for structured logs)</h4>
                <p className="text-slate-700">SDKs provide schema hints, batching, retries, and small footprint telemetry libraries. They are ideal for instrumenting application code where you need typed metadata.</p>
                <CodeBlock
                  title="Node SDK (pseudo)"
                  code={`import { LogScope } from '@logscope/sdk';
const client = new LogScope({ apiKey: process.env.LOGSCOPE_KEY, batchSize: 100 });
client.send({ ts: new Date().toISOString(), service: 'api', level: 'info', msg: 'user created', attrs: { user_id: 123 } });`}
                />
              </div>

              <div>
                <h4 className="font-medium">OTLP / OpenTelemetry</h4>
                <p className="text-slate-700">Use OTLP to capture traces, metrics, and logs consistently. Configure your OpenTelemetry exporter to send to LogScope's OTLP endpoint.</p>
              </div>

              <div>
                <h4 className="font-medium">Agents (Fluent Bit)</h4>
                <p className="text-slate-700">Agents run on hosts/containers, scrape file-based logs, and forward them. They are easy to deploy via DaemonSets in Kubernetes.</p>
              </div>
            </div>

            <Expandable>
              <div>
                <h5 className="font-semibold">Ingest envelope (canonical event)</h5>
                <pre className="p-3 mt-2 overflow-auto text-sm rounded bg-slate-50">
{`{
  "ts": "2026-02-07T00:00:00Z",
  "service": "auth",
  "level": "info",
  "msg": "login success",
  "attrs": { "user_id": 42, "region": "eu-west-1" }
}`}
                </pre>
                <p className="mt-2 text-slate-600">All SDKs &amp; agents transform source logs into this canonical envelope. Indexing and processors rely on these fields.</p>
              </div>
            </Expandable>
          </FullSection>

          {/* Pipelines */}
          <FullSection id="pipelines" title="Pipelines & Enrichment" subtitle="How logs are transformed, enriched, sampled, and scrubbed.">
            <p className="text-slate-700">
              Pipelines are the heart of LogScope's transform logic. They are defined as ordered processors that act on each event.
              Pipelines can be workspace-specific to satisfy compliance and cost requirements.
            </p>

            <div className="mt-6">
              <h4 className="font-medium">Common processors</h4>
              <PipelineProcessorsTable />
            </div>

            <div className="mt-6">
              <h4 className="font-medium">Pipeline example & explanation</h4>
              <CodeBlock
                title="pipeline.yaml"
                code={`pipeline:
  - json_decode:
  - label_extractor:
      rules:
        - from: msg
          expr: 'service=(\\w+)'
  - scrub:
      fields: [email, ssn]
  - sample:
      rate: 0.1`}
              />

              <p className="mt-3 text-slate-700">
                Explanation: decode payloads, extract labels, scrub sensitive fields, then deterministically sample 10% of remaining events to reduce storage costs for very high-volume sources.
              </p>
            </div>

            <Expandable>
              <div>
                <h5 className="font-semibold">Processor lifecycle & idempotency</h5>
                <p className="text-slate-700">Processors must be idempotent so replays do not create inconsistent state. The pipeline engine exposes input/output JSON for debugging and dry-run testing.</p>
              </div>
            </Expandable>
          </FullSection>

          {/* Search */}
          <FullSection id="search" title="Search & Alerts" subtitle="Query language, dashboards, and alerting examples.">
            <p className="text-slate-700">
              The query language supports boolean filters, aggregations, and windowed functions. Results can feed dashboards and alert rules.
            </p>

            <div className="mt-4 space-y-4">
              <h4 className="font-medium">Query example</h4>
              <CodeBlock title="Query" code={`service:payments AND level:error | stats count() by user_id`} />

              <h4 className="font-medium">Alerting patterns</h4>
              <AlertsTable />
            </div>

            <div className="mt-6">
              <h4 className="font-medium">Playbook — Investigating an error spike</h4>
              <ol className="space-y-2 list-decimal list-inside text-slate-700">
                <li>Run a query to identify top failing services and error messages.</li>
                <li>Correlate with traces for the top service to find root-cause span.</li>
                <li>Roll back or hotfix the offending change; monitor the error rate.</li>
              </ol>
            </div>
          </FullSection>

          {/* Security */}
          <FullSection id="security" title="Security & Compliance" subtitle="How data is protected and compliance enforced.">
            <p className="text-slate-700">
              Security is applied at ingestion, pipeline, and storage layers. Use workspace-scoped API keys and RBAC to limit who can read or export data.
            </p>

            <div className="mt-4">
              <h4 className="font-medium">Practical recommendations</h4>
              <ul className="space-y-2 list-disc list-inside text-slate-700">
                <li>Rotate API keys every 90 days and scope keys to minimal privileges.</li>
                <li>Enable PII redaction in pipelines for regulated environments.</li>
                <li>Use HttpOnly cookies or OAuth for UI sessions instead of exposing tokens in local storage.</li>
              </ul>
            </div>

            <Expandable>
              <div>
                <h5 className="font-semibold">Retention & export</h5>
                <p className="text-slate-700">Retention policies can route older data to S3 (cold storage). Audit logs and export events are provided for compliance checks.</p>
                <table className="w-full mt-3 text-sm border rounded-md">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left">Policy</th>
                      <th className="p-3 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t"><td className="p-3 font-medium">hot-30d</td><td className="p-3 text-slate-600">Indexed for 30 days (fast queries)</td></tr>
                    <tr className="bg-white border-t"><td className="p-3 font-medium">warm-90d</td><td className="p-3 text-slate-600">Less replicated; aggregated indexes</td></tr>
                    <tr className="border-t"><td className="p-3 font-medium">cold-archive</td><td className="p-3 text-slate-600">Object storage for long-term compliance</td></tr>
                  </tbody>
                </table>
              </div>
            </Expandable>
          </FullSection>

          {/* API */}
          <FullSection id="api" title="API Reference" subtitle="Concrete endpoints and examples you can run locally.">
            <p className="text-slate-700">All examples assume you have a workspace id and an API key. Replace <code>&lt;id&gt;</code> and <code>&lt;API_KEY&gt;</code> accordingly.</p>

            <div className="mt-4">
              <h4 className="font-medium">Endpoints</h4>
              <ApiEndpointsTable />
            </div>

            <div className="grid gap-6 mt-6 md:grid-cols-2">
              <div>
                <h5 className="font-medium">Send a batch (cURL)</h5>
                <CodeBlock
                  title="curl - batch ingest"
                  code={`curl -X POST "https://ingest.example.com/v1/workspaces/<id>/events" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '[{"ts":"2026-02-07T00:00:00Z","service":"auth","level":"info","msg":"login success"},{"ts":"2026-02-07T00:00:01Z","service":"payments","level":"error","msg":"charge failed"}]'`}
                />
              </div>

              <div>
                <h5 className="font-medium">Run a query (cURL)</h5>
                <CodeBlock
                  title="curl - query"
                  code={`curl -X POST "https://api.example.com/v1/query" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{ "query": "service:payments AND level:error | stats count() by user_id", "range": { "from": "now-15m", "to":"now" } }'`}
                />
              </div>
            </div>

            <div className="mt-8">
              <h5 className="font-medium">Operational tips</h5>
              <ul className="space-y-2 list-disc list-inside text-slate-700">
                <li>Use small batches (100–1000 events) to balance latency and throughput.</li>
                <li>Monitor ingestion error rates for malformed payloads to identify SDK issues.</li>
                <li>Use sampling to limit storage costs but preserve a deterministic sample key for traceability.</li>
              </ul>
            </div>

            <div className="flex gap-3 mt-8">
              <Button>Get started</Button>
              <Button variant="outline">Contact security</Button>
            </div>
          </FullSection>
        </div>
      </div>
    </main>
  );
}
