const BASE_URL = import.meta.env.VITE_API_URL;


function normalizeValue(key, value) {
  if (!value) return null;
  if (key === "from" || key === "to") return value; // already ISO
  return String(value);
}

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
  console.log("REQUEST URL:", url);

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}
