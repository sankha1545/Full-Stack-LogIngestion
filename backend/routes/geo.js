// backend/routes/geo.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// lightweight in-memory cache
const cache = {
  countries: { data: null, ts: 0, ttl: 1000 * 60 * 60 * 24 * 7 }, // 7 days
  states: {} // keyed by country name
};

// GET /api/geo/countries
router.get("/countries", async (req, res, next) => {
  try {
    const now = Date.now();
    if (cache.countries.data && now - cache.countries.ts < cache.countries.ttl) {
      return res.json({ source: "cache", countries: cache.countries.data });
    }

    // call restcountries
    const url = "https://restcountries.com/v3.1/all?fields=name,cca2,idd";
    const r = await axios.get(url, { timeout: 10_000 });
    const countries = (r.data || [])
      .map((c) => ({
        name: c?.name?.common || "",
        code: c?.cca2 || "",
        idd: c?.idd || {}
      }))
      .filter((c) => c.name)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

    cache.countries = { data: countries, ts: now, ttl: cache.countries.ttl };
    return res.json({ source: "remote", countries });
  } catch (err) {
    console.error("geo/countries error", err?.message || err);
    return res.status(502).json({ error: "Failed to fetch countries" });
  }
});

// POST /api/geo/states  { country: "India" }
router.post("/states", async (req, res, next) => {
  try {
    const country = (req.body?.country || "").trim();
    if (!country) return res.status(400).json({ error: "country required" });

    const key = country.toLowerCase();
    // cached
    if (cache.states[key] && Date.now() - cache.states[key].ts < 1000 * 60 * 60 * 24) {
      return res.json({ source: "cache", states: cache.states[key].data });
    }

    const url = "https://countriesnow.space/api/v0.1/countries/states";
    const r = await axios.post(url, { country }, { timeout: 10_000 });
    if (!r.data || !r.data.data) {
      return res.json({ source: "remote", states: [] });
    }

    // r.data.data.states is array of objects {name}
    const states = (r.data.data.states || []).map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean);
    cache.states[key] = { data: states, ts: Date.now() };
    return res.json({ source: "remote", states });
  } catch (err) {
    console.error("geo/states error", err?.message || err);
    return res.status(502).json({ error: "Failed to fetch states" });
  }
});

module.exports = router;
