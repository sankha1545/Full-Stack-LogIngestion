// src/components/landingpage/CountryStateSelect.jsx
import React, { useEffect, useState } from "react";
import { fetchCountries, fetchStates } from "@/api/geodata";


export default function CountryStateSelect({
  countries: propCountries,
  valueCountry,
  onCountryChange,
  valueState,
  onStateChange,
  requiredCountry = false,
  requiredState = false,
}) {
  const [countries, setCountries] = useState(propCountries || []);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [countriesError, setCountriesError] = useState("");
  const [statesError, setStatesError] = useState("");

  useEffect(() => {
    if (propCountries && propCountries.length) {
      setCountries(propCountries);
      return;
    }
    let mounted = true;
    setLoadingCountries(true);
    fetchCountries()
      .then((list) => {
        if (!mounted) return;
        setCountries(list);
      })
      .catch((err) => {
        setCountriesError("Unable to load countries");
      })
      .finally(() => mounted && setLoadingCountries(false));
    return () => (mounted = false);
  }, [propCountries]);

  useEffect(() => {
    if (!valueCountry) {
      setStates([]);
      return;
    }
    setStates([]);
    setStatesError("");
    setLoadingStates(true);
    let mounted = true;
    fetchStates(valueCountry)
      .then((slist) => {
        if (!mounted) return;
        setStates(slist || []);
        if (!slist || slist.length === 0) {
          setStatesError("No states available for selected country");
        }
      })
      .catch(() => setStatesError("Unable to load states"))
      .finally(() => mounted && setLoadingStates(false));

    return () => (mounted = false);
  }, [valueCountry]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="block mb-1 text-sm font-medium text-slate-200">
          Country {requiredCountry ? <span className="text-rose-500">*</span> : null}
        </label>
        <select
          value={valueCountry || ""}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg bg-slate-800 border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Country"
        >
          <option value="">{loadingCountries ? "Loading countries..." : "Select a country"}</option>
          {countries.map((c) => (
            <option key={c.code || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        {countriesError && <div className="mt-1 text-xs text-amber-400">{countriesError}</div>}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-slate-200">
          State / Province {requiredState ? <span className="text-rose-500">*</span> : null}
        </label>
        <select
          value={valueState || ""}
          onChange={(e) => onStateChange(e.target.value)}
          disabled={loadingStates || states.length === 0}
          className="w-full px-3 py-2 border rounded-lg bg-slate-800 border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        >
          <option value="">{loadingStates ? "Loading states..." : states.length ? "Select a state" : "No states available"}</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {statesError && <div className="mt-1 text-xs text-amber-400">{statesError}</div>}
      </div>
    </div>
  );
}
