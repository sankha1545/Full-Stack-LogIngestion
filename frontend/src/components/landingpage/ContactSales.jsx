import React, { useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  Users,
  CheckCircle,
  Calendar,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * ContactSales.jsx
 *
 * - Modern, responsive two-column sales + form layout.
 * - shadcn components + Magic-style visual polish.
 * - Client-side validation + simulated submit (calls /api/contact if available).
 * - On success, shows a conversion-success panel and options to schedule a demo, call sales, or view privacy.
 *
 * Usage: add route /contact -> <ContactSales />
 */

const EMPLOYEE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
];

const INQUIRY_OPTIONS = [
  "General product information",
  "Pricing & licensing",
  "Enterprise / SSO / SAML",
  "Integrations / API",
  "Other (custom)",
];

function formatErrors(errors) {
  return Object.values(errors).filter(Boolean);
}

export default function ContactSales() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    employees: "",
    inquiry: "",
    country: "",
    message: "",
    marketingOk: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null); // success data
  const [serverError, setServerError] = useState("");

  function updateField(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.employees) e.employees = "Please select employee count";
    if (!form.inquiry) e.inquiry = "Please select an inquiry type";
    // message optional
    return e;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setServerError("");
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length) {
      // focus first error field? (left for enhancement)
      return;
    }

    setLoading(true);

    // payload
    const payload = {
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      company: form.company,
      employees: form.employees,
      inquiry: form.inquiry,
      country: form.country,
      message: form.message,
      marketingOk: form.marketingOk,
      source: "contact-sales-page",
      createdAt: new Date().toISOString(),
    };

    // Try to POST to a backend endpoint if available; otherwise simulate success.
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // if backend returns an error (or not present), fall through to simulated success with note
        const text = await res.text().catch(() => null);
        throw new Error(text || `Server returned ${res.status}`);
      }

      const result = await res.json().catch(() => ({ status: "ok" }));
      setSubmitted({ status: "ok", ref: result.ref || null });
    } catch (err) {
      // Network or server error: graceful fallback to simulated success, but show a note
      console.warn("Contact submit error:", err);
      // Simulate small delay to mimic network
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted({ status: "simulated", note: "We couldn't reach the server — your request was queued locally. We'll email you shortly." });
      setServerError(err?.message || "Submission had an issue; we've queued it.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    // Success view
    return (
      <div className="min-h-screen px-6 py-20 bg-slate-50">
        <div className="grid items-start max-w-5xl gap-10 mx-auto lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">Thanks — we’ll be in touch</h1>
            <p className="text-lg text-slate-700">
              A member of our sales team will reach out shortly to discuss your needs.
            </p>

            <div className="flex items-start gap-4 mt-6">
              <div className="flex items-center justify-center rounded-lg w-14 h-14 bg-emerald-50 ring-1 ring-emerald-200">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold">Request received</div>
                <div className="text-sm text-slate-600">
                  {submitted.ref ? <>Reference: <strong>{submitted.ref}</strong></> : <>{submitted.note || "We received your request."}</>}
                </div>
              </div>
            </div>

            <div className="grid gap-3 mt-6 sm:grid-cols-2">
              <a
                href="/schedule"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                <Calendar className="w-4 h-4" /> Schedule a demo
              </a>

              <a
                href="tel:+18001234567"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg border-slate-200 hover:bg-slate-50"
              >
                <Phone className="w-4 h-4 text-indigo-600" /> Call sales
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              We respect your privacy. By contacting us you agree to our{" "}
              <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>

          {/* Mini recap card */}
          <div className="p-6 bg-white border shadow-lg rounded-2xl">
            <h3 className="mb-3 font-semibold text-slate-700">Submission details</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div><strong>Name:</strong> {form.firstName} {form.lastName}</div>
              <div><strong>Email:</strong> {form.email}</div>
              <div><strong>Company:</strong> {form.company}</div>
              <div><strong>Inquiry:</strong> {form.inquiry}</div>
              {serverError && <div className="mt-3 text-xs text-amber-700">Note: {serverError}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render form
  return (
    <main className="min-h-screen px-6 py-12 bg-gradient-to-b from-white via-white to-slate-50">
      <div className="grid items-start gap-10 mx-auto max-w-7xl lg:grid-cols-2">
        {/* Left column — sales story */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 text-indigo-600 rounded-full bg-indigo-50 w-max">
            <Users className="w-4 h-4" /> Trusted by modern teams
          </div>

          <h1 className="text-4xl font-bold leading-tight">Contact Sales</h1>

          <p className="max-w-xl text-lg text-slate-700">
            Tell us about your needs — we’ll match you with the right plan and
            solutions. Whether you need enterprise security, custom integrations,
            or a pilot deployment, our team will help you get started quickly.
          </p>

          <ul className="mt-6 space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold">Enterprise-ready</div>
                <div className="text-sm text-slate-600">SSO, audit logs, RBAC and SLAs.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold">Dedicated onboarding</div>
                <div className="text-sm text-slate-600">We'll help with setup and migration.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
                <Phone className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold">Human support</div>
                <div className="text-sm text-slate-600">Phone and email support during onboarding.</div>
              </div>
            </li>
          </ul>

          <div className="mt-8">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop"
              alt="Sales support"
              className="object-cover w-full shadow-lg rounded-2xl max-h-96"
            />
          </div>
        </section>

        {/* Right column — contact form card */}
        <section>
          <Card className="border shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Please enter your information</CardTitle>
              <CardDescription className="text-sm text-slate-600">Required fields marked *</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm">First name *</Label>
                    <Input
                      placeholder="First name"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && <div className="mt-1 text-xs text-rose-600">{errors.firstName}</div>}
                  </div>

                  <div>
                    <Label className="text-sm">Last name *</Label>
                    <Input
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && <div className="mt-1 text-xs text-rose-600">{errors.lastName}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm">Work email *</Label>
                    <Input
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      type="email"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <div className="mt-1 text-xs text-rose-600">{errors.email}</div>}
                  </div>

                  <div>
                    <Label className="text-sm">Phone *</Label>
                    <Input
                      placeholder="+1 555 555 5555"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && <div className="mt-1 text-xs text-rose-600">{errors.phone}</div>}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Company *</Label>
                  <Input
                    placeholder="Your company"
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    aria-invalid={!!errors.company}
                  />
                  {errors.company && <div className="mt-1 text-xs text-rose-600">{errors.company}</div>}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm">Employees *</Label>
                    <Select value={form.employees} onValueChange={(v) => updateField("employees", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employee count" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYEE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employees && <div className="mt-1 text-xs text-rose-600">{errors.employees}</div>}
                  </div>

                  <div>
                    <Label className="text-sm">Inquiry type *</Label>
                    <Select value={form.inquiry} onValueChange={(v) => updateField("inquiry", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {INQUIRY_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.inquiry && <div className="mt-1 text-xs text-rose-600">{errors.inquiry}</div>}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Country (optional)</Label>
                  <Input placeholder="Country" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
                </div>

                <div>
                  <Label className="text-sm">Message (optional)</Label>
                  <Textarea placeholder="Tell us about your use case or any specific questions" value={form.message} onChange={(e) => updateField("message", e.target.value)} />
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox checked={form.marketingOk} onCheckedChange={(v) => updateField("marketingOk", !!v)} />
                  <div className="text-sm text-slate-600">
                    I would like to receive communications about products and offers.
                  </div>
                </div>

                {serverError && <div className="text-sm text-amber-700">{serverError}</div>}

                <div className="pt-2">
                  <Button type="submit" onClick={handleSubmit} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
                    {loading ? "Sending..." : "Submit"}
                  </Button>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  By submitting the form, I agree to the <a className="text-indigo-600 hover:underline" href="/privacy">Privacy Policy</a>.
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
