// src/data/architecture.js
export const ARCH_DOC = {
  title: "LogScope — Architecture Overview",
  tagline:
    "A readable, production-ready reference that explains how LogScope ingests, processes, stores, and serves observability data — intentionally written for engineers and non-engineers alike.",
  summary:
    "LogScope is designed to collect telemetry (logs, traces, metrics) from your systems, process it through streaming pipelines, index it for fast searches, and surface insights through dashboards and alerting. The architecture emphasizes durability, scalability, and the ability to export or integrate with third-party tools.",
  goals: [
    "Reliable ingestion with at-least-once delivery and backpressure handling.",
    "Streaming transformation pipeline for enrichment, redaction, and compliance filters.",
    "Cost-effective long-term storage with tiered retention (hot -> cold -> archive).",
    "Fast ad-hoc query and search across structured and unstructured logs.",
    "Easy exportability and open standards (OTel, Prometheus, S3)."
  ],
  components: [
    {
      id: "ingestion",
      title: "Ingestion Layer",
      plain:
        "Agents, SDKs and collectors accept incoming telemetry. They buffer data locally, apply lightweight batching, and forward to the ingestion gateway. This layer normalizes incoming data into a common envelope (timestamp, service, trace-id, payload).",
      technical:
        "Agents run as sidecars or daemonsets for Kubernetes and use backpressure-aware TCP/HTTP connections. They support structured JSON logs, OTLP traces, and metrics exporters."
    },
    {
      id: "gateway",
      title: "Ingestion Gateway",
      plain:
        "A horizontally scalable front door that accepts high-rate traffic, authenticates clients, and performs initial sampling and routing to pipeline workers.",
      technical:
        "Gateway nodes are stateless, load-balanced, and expose per-connection quotas. They perform immediate schema checks and route messages to partitioned stream topics (e.g., Kafka, Pulsar, or managed streams)."
    },
    {
      id: "streaming",
      title: "Streaming Processing Pipelines",
      plain:
        "Workers consume from streams, enrich records (add metadata), perform redaction or PII masking, and optionally sample or aggregate events before indexing or storage.",
      technical:
        "Implemented with consumer groups (Kafka/Pulsar) or stream processors (Flink) with idempotent sinks and exactly-once semantics where required. Steps are configured as small transformations (Lua/JS/ WASM)."
    },
    {
      id: "indexing",
      title: "Index & Query Engine",
      plain:
        "Indexed copies of parsed fields enable low-latency search and aggregations. Indexes are time-partitioned for efficient retention and deletion.",
      technical:
        "Indexes use inverted indices for full-text and columnar/LSM structures for metadata. Hot indices are kept on SSD-backed nodes; cold indices archived on object storage with index summaries for fast cold queries."
    },
    {
      id: "storage",
      title: "Object Storage & Long-term Archive",
      plain:
        "Raw or compacted data goes to cost-effective object storage for compliance and long-term retention. Short-term hot storage holds recent raw logs for quick retrieval.",
      technical:
        "Use S3-compatible storage for cold retention. Implement lifecycle policies and immutable (WORM) options where required for compliance."
    },
    {
      id: "api_ui",
      title: "API & UI Layer",
      plain:
        "REST/GraphQL APIs power the frontend dashboards and CLIs. The UI provides dashboards, saved queries, runbooks, and alerting configuration.",
      technical:
        "APIs enforce RBAC, rate limiting, and query multiplexing; they translate UI queries into multi-shard reads across indexes and object storage."
    },
    {
      id: "orchestration",
      title: "Orchestration & Operators",
      plain:
        "Kubernetes operators and deployment manifests automate upgrades, scaling, and backups.",
      technical:
        "Use Helm + Kustomize or GitOps (ArgoCD) for declarative deployment; operators handle schema migrations and safe rolling upgrades."
    }
  ],
  dataFlow: [
    {
      id: "flow_simple",
      title: "Simplified Data Flow (explained for non-IT)",
      steps: [
        {
          step: "1 — Collect",
          detail:
            "Your applications, servers, and cloud services send logs, traces and metrics to a tiny agent running beside them. Think of the agent as a postman collecting letters."
        },
        {
          step: "2 — Gateway",
          detail:
            "Agents forward the data to a gateway (the post office) which authenticates and quickly forwards messages to processing workers."
        },
        {
          step: "3 — Process",
          detail:
            "Workers enrich and prepare the data: tag it with service names, remove sensitive information, and group related messages (like linking a trace to logs)."
        },
        {
          step: "4 — Store & Index",
          detail:
            "Useful pieces are indexed for fast searching (recent activity). The raw data is stored for long-term audit and compliance."
        },
        {
          step: "5 — Serve",
          detail:
            "APIs and dashboards let users search, build alerts, and inspect traces. Notifications or escalations (e.g. PagerDuty) are sent from here."
        }
      ]
    }
  ],
  security: {
    overview:
      "Security is applied in layers: encrypted transport (TLS), strong auth (tokens or mTLS), and access control at the API level.",
    practices: [
      "Encrypt data in transit and at rest.",
      "Use short-lived tokens and rotate keys via Vault.",
      "Mask or redact PII at ingestion where policy requires."
    ]
  },
  scaling: {
    overview:
      "LogScope scales by partitioning streams and horizontally scaling processing and query nodes.",
    patterns: [
      "Partition by customer/project ID for multi-tenant isolation.",
      "Autoscale consumers based on lag metrics.",
      "Use tiered storage to reduce costs (hot SSD for last 30 days, cold S3 afterwards)."
    ]
  },
  diagramNote:
    "Below is a simplified diagram showing the major layers. It is intentionally non-technical and intended to help stakeholders understand how data flows and where responsibilities lie.",
  faq: [
    { q: "Can I export raw logs?", a: "Yes — raw logs are written to object storage and can be exported using lifecycle policies or API exports." },
    { q: "How is PII handled?", a: "You can configure redaction at ingestion. The pipeline supports regex or rule-based redaction as well as tokenization." },
    { q: "What happens when the pipeline is overloaded?", a: "The gateway and agents support backpressure and local buffering. We use rate-based sampling and priority queues during sustained overload." }
  ],
  contact:
    "If you need an architecture review or help implementing this design, contact LogScope Solutions — solutions@example.com."
};
