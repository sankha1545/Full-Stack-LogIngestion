const BASE_URL = "/api";

/* ---------- Value Normalizer ---------- */
function normalizeValue(key, value) {
  if (value === undefined || value === null) return null;
  if (key === "from" || key === "to") return value;
  return String(value);
}

/* ---------- Error Normalizer ---------- */
async function handleResponse(res) {
  if (res.ok) return res.json();

  let message = "Failed to fetch logs";

  try {
    const data = await res.json();
    if (data?.error) message = data.error;
    else if (data?.message) message = data.message;
  } catch {
    message = res.statusText || message;
  }

  const error = new Error(message);
  error.status = res.status;
  throw error;
}

/* ---------- Main API ---------- */
export async function fetchLogs(filters = {}, signal) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const norm = normalizeValue(key, value);

    if (norm !== null && norm !== undefined && norm !== "") {
      if (key === "caseSensitive") {
        params.append("caseSensitive", value ? "true" : "false");
      } else {
        params.append(key, norm);
      }
    }
  });

  const url = `${BASE_URL}/logs?${params.toString()}`;

  if (import.meta.env.DEV) {
    console.log("REQUEST URL:", url);
  }

  try {
    const res = await fetch(url, { signal });
    return await handleResponse(res);
  } catch (err) {
    // silently ignore aborts (normal behavior)
    if (err.name === "AbortError") return;

    if (!err.status) {
      err.message = "Network error: Unable to reach server";
    }

    throw err;
  }
}
