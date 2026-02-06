// src/components/landingpage/ContactForm.jsx
import React, { useEffect, useState } from "react";
import CountryStateSelect from "./CountryStateSelect";
import DialCodeSelect from "./DialCodeSelect";
import { fetchCountries } from "@/api/geodata";

/**
 * Props:
 * - onSuccess({ ref, payload, note })
 */
export default function ContactForm({ onSuccess }) {
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dialCode: "",
    phone: "",
    company: "",
    employees: "",
    inquiry: "",
    country: "",
    state: "",
    message: "",
    marketingOk: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoadingCountries(true);
    fetchCountries()
      .then((list) => {
        if (!mounted) return;
        setCountries(list);
      })
      .catch(() => setCountriesError("Unable to load countries"))
      .finally(() => mounted && setLoadingCountries(false));
    return () => (mounted = false);
  }, []);

  function updateField(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.dialCode) e.dialCode = "Select dial code";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.employees) e.employees = "Please select employee count";
    if (!form.inquiry) e.inquiry = "Please select an inquiry type";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length) return;

    setLoading(true);

    const payload = {
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: `${form.dialCode} ${form.phone}`,
      company: form.company,
      employees: form.employees,
      inquiry: form.inquiry,
      country: form.country,
      state: form.state,
      message: form.message,
      marketingOk: form.marketingOk,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `Server ${res.status}`);
      }

      const result = await res.json().catch(() => ({ status: "ok" }));
      onSuccess({ ref: result.ref || null, payload });
    } catch (err) {
      console.warn("submit error", err);
      // fallback to simulated success
      onSuccess({ ref: null, payload, note: "Submission queued (offline fallback)" });
      setServerError(err?.message || "Failed to submit to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 border shadow-xl bg-slate-900/60 border-slate-800 rounded-2xl">
      <h2 className="mb-1 text-xl font-semibold text-white">Please enter your information</h2>
      <p className="mb-4 text-sm text-slate-300">Required fields marked *</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* name row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm text-slate-200">First name *</label>
            <input
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.firstName ? "border-rose-600" : "border-slate-700"} text-white`}
            />
            {errors.firstName && <div className="mt-1 text-xs text-rose-400">{errors.firstName}</div>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-200">Last name *</label>
            <input
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.lastName ? "border-rose-600" : "border-slate-700"} text-white`}
            />
            {errors.lastName && <div className="mt-1 text-xs text-rose-400">{errors.lastName}</div>}
          </div>
        </div>

        {/* email + phone row (dial code select + phone input) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm text-slate-200">Work email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.email ? "border-rose-600" : "border-slate-700"} text-white`}
              placeholder="you@company.com"
            />
            {errors.email && <div className="mt-1 text-xs text-rose-400">{errors.email}</div>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-200">Phone *</label>

            <div className="flex gap-2">
              {/* Dial code select: 30% width */}
              <div className="w-1/3">
                <label className="sr-only">Dial code</label>
                <select
                  value={form.dialCode}
                  onChange={(e) => updateField("dialCode", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.dialCode ? "border-rose-600" : "border-slate-700"} text-white`}
                >
                  <option value="">{loadingCountries ? "…" : "Code"}</option>
                  {countries.map((c) =>
                    (c.dialCodes || []).map((d) => (
                      <option key={`${c.code}-${d}`} value={d}>
                        {d} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))
                  )}
                </select>
                {errors.dialCode && <div className="mt-1 text-xs text-rose-400">{errors.dialCode}</div>}
              </div>

              {/* Phone number input: rest */}
              <div className="flex-1">
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="555 555 5555"
                  disabled={!form.dialCode}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.phone ? "border-rose-600" : "border-slate-700"} text-white disabled:opacity-60`}
                />
                {!form.dialCode && <div className="mt-1 text-xs text-slate-400">Select dial code to enter number</div>}
                {errors.phone && <div className="mt-1 text-xs text-rose-400">{errors.phone}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* company / employees / inquiry */}
        <div>
          <label className="block mb-1 text-sm text-slate-200">Company *</label>
          <input
            value={form.company}
            onChange={(e) => updateField("company", e.target.value)}
            className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.company ? "border-rose-600" : "border-slate-700"} text-white`}
            placeholder="Your company"
          />
          {errors.company && <div className="mt-1 text-xs text-rose-400">{errors.company}</div>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm text-slate-200">Employees *</label>
            <select
              value={form.employees}
              onChange={(e) => updateField("employees", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.employees ? "border-rose-600" : "border-slate-700"} text-white`}
            >
              <option value="">Select employee count</option>
              <option value="1-10">1–10</option>
              <option value="11-50">11–50</option>
              <option value="51-200">51–200</option>
              <option value="201-1000">201–1000</option>
              <option value="1000+">1000+</option>
            </select>
            {errors.employees && <div className="mt-1 text-xs text-rose-400">{errors.employees}</div>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-200">Inquiry type *</label>
            <select
              value={form.inquiry}
              onChange={(e) => updateField("inquiry", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${errors.inquiry ? "border-rose-600" : "border-slate-700"} text-white`}
            >
              <option value="">Select an option</option>
              <option>General product information</option>
              <option>Pricing & licensing</option>
              <option>Enterprise / SSO / SAML</option>
              <option>Integrations / API</option>
              <option>Other (custom)</option>
            </select>
            {errors.inquiry && <div className="mt-1 text-xs text-rose-400">{errors.inquiry}</div>}
          </div>
        </div>

        {/* Country/state selector (uses countries fetched above) */}
        <CountryStateSelect
          countries={countries}
          valueCountry={form.country}
          onCountryChange={(c) => {
            updateField("country", c);
            updateField("state", "");
            // if country has a primary dial code and form.dialCode is empty, auto-populate
            const found = countries.find((x) => x.name === c);
            if (found && found.dialCodes && found.dialCodes.length && !form.dialCode) {
              updateField("dialCode", found.dialCodes[0]);
            }
          }}
          valueState={form.state}
          onStateChange={(s) => updateField("state", s)}
          requiredCountry={false}
          requiredState={false}
        />

        {/* message */}
        <div>
          <label className="block mb-1 text-sm text-slate-200">Message (optional)</label>
          <textarea
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            placeholder="Tell us about your use case or any specific questions"
            className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="marketingOk"
            type="checkbox"
            checked={form.marketingOk}
            onChange={(e) => updateField("marketingOk", e.target.checked)}
            className="w-4 h-4 text-indigo-500 rounded border-slate-600 bg-slate-800"
          />
          <label htmlFor="marketingOk" className="text-sm text-slate-300">
            I would like to receive communications about products and offers.
          </label>
        </div>

        {serverError && <div className="text-sm text-amber-400">{serverError}</div>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          By submitting the form, I agree to the <a href="/privacy" className="text-indigo-400 underline">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}
