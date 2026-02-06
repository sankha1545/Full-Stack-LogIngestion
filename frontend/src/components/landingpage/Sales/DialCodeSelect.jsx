// src/components/landingpage/DialCodeSelect.jsx
import React, { useEffect, useMemo, useState } from "react";


export default function DialCodeSelect({ countries = [], selectedCountryName = "", valueDialCode, onDialCodeChange }) {
  // build unique dial codes list
  const uniqueDialCodes = useMemo(() => {
    const set = new Set();
    countries.forEach((c) => {
      (c.dialCodes || []).forEach((d) => set.add(d));
    });
    // sort numeric by numeric value (remove plus)
    return Array.from(set).sort((a, b) => {
      const na = Number(a.replace(/\D/g, "")) || 0;
      const nb = Number(b.replace(/\D/g, "")) || 0;
      return na - nb;
    });
  }, [countries]);

  // default dial code from selected country (first dialCodes)
  useEffect(() => {
    if (!selectedCountryName) return;
    const found = countries.find((c) => c.name === selectedCountryName);
    const primary = found && found.dialCodes && found.dialCodes.length ? found.dialCodes[0] : "";
    if (primary && primary !== valueDialCode) {
      onDialCodeChange(primary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryName, countries]);

  return (
    <div>
      <label className="block mb-1 text-sm text-slate-200">Dial code</label>
      <select
        value={valueDialCode || ""}
        onChange={(e) => onDialCodeChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg bg-slate-800 border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select code</option>
        {uniqueDialCodes.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
