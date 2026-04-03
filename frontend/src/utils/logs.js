export function classifyLogKind(log = {}) {
  const metadata =
    log?.metadata && typeof log.metadata === "object"
      ? log.metadata
      : log?.meta && typeof log.meta === "object"
        ? log.meta
        : {};

  const explicit = metadata.eventType || metadata.type || metadata.category;
  if (explicit) return String(explicit).trim().toUpperCase();

  const sourceText = [
    log?.message,
    log?.service,
    log?.resourceId,
    metadata.route,
    metadata.url,
    metadata.operation,
    metadata.action,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (sourceText.includes("exception") || sourceText.includes("crash") || sourceText.includes("panic")) {
    return "EXCEPTION";
  }
  if (sourceText.includes("auth") || sourceText.includes("login") || sourceText.includes("signin") || sourceText.includes("token")) {
    return "AUTH";
  }
  if (sourceText.includes("payment") || sourceText.includes("checkout") || sourceText.includes("billing")) {
    return "PAYMENT";
  }
  if (sourceText.includes("db") || sourceText.includes("query") || sourceText.includes("sql") || sourceText.includes("mongo")) {
    return "DATABASE";
  }
  if (sourceText.includes("http") || sourceText.includes("request") || sourceText.includes("response") || sourceText.includes("api")) {
    return "REQUEST";
  }
  if (sourceText.includes("queue") || sourceText.includes("job") || sourceText.includes("worker")) {
    return "BACKGROUND_JOB";
  }
  if (sourceText.includes("deploy") || sourceText.includes("release") || sourceText.includes("build")) {
    return "DEPLOYMENT";
  }
  return "APPLICATION";
}

export function getLogLevelTone(level) {
  switch (String(level || "").toUpperCase()) {
    case "FATAL":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "ERROR":
      return "bg-red-100 text-red-700 border-red-200";
    case "WARN":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "DEBUG":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-sky-100 text-sky-700 border-sky-200";
  }
}

export function formatLogTimestamp(value) {
  if (!value) return "NA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";

  return date.toLocaleString();
}
