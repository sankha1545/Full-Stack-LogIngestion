// src/lib/geodata.js
const COUNTRIES_CACHE_KEY = "geo:countries:v2";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days


export async function fetchCountries() {
  try {
    const cached = JSON.parse(localStorage.getItem(COUNTRIES_CACHE_KEY) || "null");
    if (cached && Date.now() - cached._fetchedAt < CACHE_TTL_MS) {
      return cached.countries;
    }
  } catch (err) {
    // ignore cache read errors
  }

  // request name, cca2, idd
  const url = "https://restcountries.com/v3.1/all?fields=name,cca2,idd";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch countries");

  const data = await res.json();

  // Map into shape: { name, code, dialCodes: ["+1","+1-340"] (we'll normalize to root only) }
  const countries = data
    .map((c) => {
      const name = c?.name?.common || "";
      const code = c?.cca2 || "";
      const idd = c?.idd || {};
      // idd.root like "+1", idd.suffixes: ["241","242"] or [].
      const root = idd?.root || "";
      const suffixes = Array.isArray(idd?.suffixes) ? idd.suffixes : [];

      // normalize dialCodes: use root alone if no suffixes, otherwise root + suffix (take root only recommended)
      // Many countries use root + suffixes for e.g. "+1" with suffixes for regions; we'll include root and root+suffix (optional).
      const dialCodes = new Set();
      if (root) {
        dialCodes.add(root);
        if (suffixes.length) {
          // include root+suffix variation for completeness but may be many; keep only root and root+first suffix to avoid explosion
          suffixes.forEach((suf) => {
            if (suf && suf.length <= 4) dialCodes.add(root + suf);
          });
        }
      }

      return {
        name,
        code,
        dialCodes: Array.from(dialCodes),
      };
    })
    .filter((c) => c.name && c.dialCodes.length) // only keep countries with dialing info
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  try {
    localStorage.setItem(COUNTRIES_CACHE_KEY, JSON.stringify({ _fetchedAt: Date.now(), countries }));
  } catch (err) {
    // ignore
  }

  return countries;
}

/**
 * fetchStates(countryName)
 * - Uses countriesnow.space POST endpoint to get states for a country.
 * - Returns [] if missing or on error (UI handles it gracefully)
 */
export async function fetchStates(countryName) {
  if (!countryName) return [];
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName }),
    });
    if (!res.ok) return [];
    const payload = await res.json();
    if (!payload?.data?.states) return [];
    const states = payload.data.states.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean);
    states.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return states;
  } catch (err) {
    // network/CORS
    return [];
  }
}
