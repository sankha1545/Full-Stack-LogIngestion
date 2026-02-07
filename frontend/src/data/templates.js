// src/data/templates.js
import {
  Activity,
  Server,
  BarChart3,
  Shield,
  Search,
  Zap
} from "lucide-react";

export const TEMPLATES = [
  {
    id: "incidents",
    title: "Incident Debugging",
    description:
      "Investigate production outages using correlated logs, traces, and error contexts to restore service faster.",
    stack: ["Kubernetes", "Node.js", "Postgres"],
    icon: Activity,
    docs: {
      overview:
        "This template collects traces, application logs, and deployment metadata and correlates them to present a timeline centered on the incident. It is optimized for MTTR reduction and root-cause analysis.",
      use_cases: [
        "Investigate production outages after a deploy",
        "Correlate 503/5xx errors with recent code changes and trace spans",
        "Quickly surface related logs across services and pods"
      ],
      features: [
        "Automatic trace-log correlation",
        "Prebuilt queries for common error classes",
        "Timeline view with deployment annotations",
        "Saved investigation runbooks"
      ],
      methodology: [
        {
          title: "Event correlation",
          body:
            "We map traces to log groups by trace IDs and timestamps; where trace IDs aren't present, we use a fuzzy time-window correlation based on request IDs, source IPs and short-lived identifiers."
        },
        {
          title: "Prioritized evidence",
          body:
            "Errors are scored by impact (users affected) and frequency. The UI surfaces highest-impact evidence first with quick links into logs and traces."
        }
      ],
      setup: [
        "Install the LogScope agent on application hosts (daemonset for k8s).",
        "Enable trace headers in your app (W3C traceparent or X-Request-ID).",
        "Configure logging to send structured JSON to the collector.",
        "Import the incident dashboard and runbook from this template."
      ],
      example_snippet:
`# Quick example: Query to find top error messages in last 15m
SELECT message, count(*) as occurrences
FROM logs
WHERE level = 'error' AND timestamp >= now() - interval '15 minutes'
GROUP BY message
ORDER BY occurrences DESC
LIMIT 10;`,
      references: [
        { label: "Trace correlation design doc", url: "https://example.com/trace-correlation" },
        { label: "Runbook best practices", url: "https://example.com/runbooks" }
      ]
    }
  },
  {
    id: "health",
    title: "Microservice Health",
    description:
      "Continuous service health checks, SLI/SLO visualization, and alerting templates for microservice fleets.",
    stack: ["Kubernetes", "Prometheus"],
    icon: Server,
    docs: {
      overview:
        "This template provides dashboards and alerts to monitor latency, error rates, and traffic for each microservice. It includes SLO definitions and alerting rules.",
      use_cases: [
        "SLO-based service monitoring",
        "Detect performance regressions post-deploy",
        "Track error budget consumption"
      ],
      features: [
        "SLO dashboard with burn rate visualization",
        "Service-level error rate and latency charts",
        "Predefined alerting rules for rapid triage"
      ],
      methodology: [
        {
          title: "SLO calculation",
          body:
            "SLOs are calculated using rolling-window aggregations; we recommend 30d windows for availability and 7d for latency percentiles for fast-moving services."
        }
      ],
      setup: [
        "Scrape service metrics via Prometheus exporters.",
        "Annotate deployments with `service` and `env` labels.",
        "Import SLO rules from the template and tune thresholds."
      ],
      example_snippet:
`# Example PromQL: 95th percentile latency for service 'api'
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="api"}[5m])) by (le))`,
      references: [
        { label: "SLO concepts", url: "https://example.com/slo" },
        { label: "Prometheus best practices", url: "https://prometheus.io/docs" }
      ]
    }
  },
  {
    id: "perf",
    title: "Performance Analysis",
    description:
      "Pinpoint heavy call paths and resource hotspots that cause latency spikes across services.",
    stack: ["Node.js", "Python"],
    icon: BarChart3,
    docs: {
      overview:
        "This performance template helps identify slow code paths, database bottlenecks, and overloaded endpoints. Includes flamegraphs and span breakdowns.",
      use_cases: [
        "Find slow endpoints after a new release",
        "Measure backend query latency contribution",
        "Detect GC or thread-pool contention"
      ],
      features: [
        "Flamegraphs and span breakdowns",
        "Top N slow endpoints",
        "Resource contention alerts"
      ],
      methodology: [
        {
          title: "Span sampling",
          body:
            "Use adaptive span sampling that increases sample rate during latency anomalies to capture more diagnostic data without increasing baseline cost."
        }
      ],
      setup: [
        "Enable distributed tracing with a sampling strategy.",
        "Integrate with APM agent for flamegraph collection.",
        "Import performance dashboards and configured alerts."
      ],
      example_snippet:
`// Node example: add basic tracing header (pseudo)
app.use((req, res, next) => {
  req.headers['trace-id'] = generateTraceId();
  next();
});`,
      references: [
        { label: "Tracing guide", url: "https://example.com/tracing" }
      ]
    }
  },
  {
    id: "audit",
    title: "Audit & Compliance",
    description:
      "Immutable log storage, queryable trails, and retention policies for compliance and audits.",
    stack: ["Postgres", "S3"],
    icon: Shield,
    docs: {
      overview:
        "This template sets up append-only logs, WORM storage options, and audit dashboards designed for compliance needs.",
      use_cases: [
        "Maintain tamper-proof audit trails",
        "Support compliance reporting",
        "Forensic investigations"
      ],
      features: [
        "Append-only storage patterns",
        "Retention & archival workflows",
        "Searchable audit trails"
      ],
      methodology: [
        {
          title: "Retention lifecycle",
          body:
            "Use tiered storage: hot store for 30–90 days, then cold archive (S3 Glacier) for long-term retention."
        }
      ],
      setup: [
        "Configure write-once permissions to audit buckets.",
        "Set up ingestion with immutability flags.",
        "Import the compliance dashboard for auditors."
      ],
      example_snippet:
`-- Example: mark log entries as immutable
UPDATE logs SET immutable = true WHERE timestamp < now() - interval '1 day';`,
      references: [
        { label: "Compliance checklist", url: "https://example.com/compliance" }
      ]
    }
  },
  {
    id: "search",
    title: "Log Exploration",
    description:
      "Advanced full-text and structured search with saved queries and session replay for fast investigations.",
    stack: ["Search Engine"],
    icon: Search,
    docs: {
      overview:
        "This template configures indexes, parsing rules, and search dashboards to accelerate ad-hoc investigations.",
      use_cases: [
        "Ad-hoc root-cause analysis",
        "Saved frequent queries for teams",
        "Session replay integration"
      ],
      features: [
        "Full-text + structured search",
        "Saved queries and snippets",
        "Search-based alerting"
      ],
      methodology: [
        {
          title: "Indexing strategy",
          body:
            "Use time-partitioned indexes and field mappings for high-cardinality fields. Prefer nested fields for structured payloads."
        }
      ],
      setup: [
        "Configure schema mappings for primary log fields.",
        "Create time-based indices and retention policies.",
        "Import the search dashboard templates."
      ],
      example_snippet:
`# Example: search for failed OAuth calls in the last hour
message:("oauth" AND "failed") AND timestamp:[now-1h TO now]`,
      references: []
    }
  },
  {
    id: "alerts",
    title: "Alerting & Runbooks",
    description:
      "Turn queries into alerts with attached runbooks, playbooks, and postmortem templates for consistent incident response.",
    stack: ["Slack", "PagerDuty"],
    icon: Zap,
    docs: {
      overview:
        "This template links query results to alerting pipelines, with runbooks attached for consistent response.",
      use_cases: [
        "Automated paging for critical issues",
        "Attach runbooks to alerts",
        "SLA breach notifications"
      ],
      features: [
        "Alert templates",
        "Runbook attachments",
        "Escalation playbooks"
      ],
      methodology: [
        {
          title: "Alert tuning",
          body:
            "Start with conservative thresholds and gradually tighten with observed data. Use multi-window checks to reduce flapping alerts."
        }
      ],
      setup: [
        "Configure alert receivers (Slack, PagerDuty).",
        "Attach runbooks to alert rules.",
        "Tune thresholds in staging before production."
      ],
      example_snippet:
`# Example alert rule (pseudo)
IF (error_rate > 0.05 AND window == 5m) THEN notify pagerduty('sre-team')`,
      references: []
    }
  }
];
