const BASE_URL = "http://localhost:3001";

/**
 * Normalize filter values before sending:
 * - `from` / `to` expected as ISO strings.
 * - Accept datetime-local (YYYY-MM-DDTHH:mm) and convert to ISO.
 */
function normalizeValue(key, value) {
  if (value == null || value === "") return null;

  // If value looks like datetime-local (no seconds, no Z)
  if (key === "from" || key === "to") {
    // If the user already provided an ISO string, leave it
    // Accept both "2026-01-25T14:30" and "2026-01-25T14:30:00.000Z"
    try {
      // If it's a plain local datetime without timezone (no trailing Z)
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
        // interpret as local time, convert to ISO UTC
        return new Date(value).toISOString();
      }
      // otherwise attempt to parse and re-emit ISO
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    } catch (e) {
      return null;
    }
  }

  // For other keys, just return string
  return String(value);
}

export async function fetchLogs(filters = {}, signal) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    // prefix: pass the raw key, but normalize time values
    const norm = normalizeValue(key, value);
    if (norm !== null && norm !== undefined && norm !== "") {
      // For boolean caseSensitive, send "1" or "0"
      if (key === "caseSensitive") {
        params.append("caseSensitive", value ? "1" : "0");
      } else {
        params.append(key, norm);
      }
    }
  });

  const url = `${BASE_URL}/logs?${params.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to fetch logs: " + res.status);
  return res.json();
}
