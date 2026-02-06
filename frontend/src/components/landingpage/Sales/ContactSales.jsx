// src/components/landingpage/ContactSales.jsx
import React, { useState } from "react";
import { Users, Building2, Mail, Phone, CheckCircle, Calendar } from "lucide-react";
import ContactForm from "./ContactForm";

export default function ContactSales() {
  const [success, setSuccess] = useState(null);

  function handleSuccess(result) {
    setSuccess(result);
  }

  if (success) {
    return (
      <div className="min-h-screen px-6 py-20 text-white bg-slate-900">
        <div className="grid items-start max-w-5xl gap-10 mx-auto lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">Thanks — we’ll be in touch</h1>
            <p className="text-lg text-slate-300">
              A member of our sales team will reach out shortly to discuss your needs.
            </p>

            <div className="flex items-start gap-4 mt-6">
              <div className="flex items-center justify-center rounded-lg w-14 h-14 bg-emerald-700/10 ring-1 ring-emerald-700/30">
                <CheckCircle className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <div className="font-semibold">Request received</div>
                <div className="text-sm text-slate-300">
                  {success.ref ? <>Reference: <strong>{success.ref}</strong></> : <>We received your request. {success.note ? success.note : null}</>}
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg border-slate-700 hover:bg-slate-800"
              >
                <Phone className="w-4 h-4 text-indigo-300" /> Call sales
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              We respect your privacy. By contacting us you agree to our{" "}
              <a href="/privacy" className="text-indigo-300 underline">Privacy Policy</a>.
            </p>
          </div>

          <div className="p-6 border shadow-xl rounded-2xl bg-slate-800 border-slate-700">
            <h3 className="mb-3 text-lg font-semibold">Submission details</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div><strong>Name:</strong> {success.payload?.name || ""}</div>
              <div><strong>Email:</strong> {success.payload?.email || ""}</div>
              <div><strong>Company:</strong> {success.payload?.company || ""}</div>
              <div><strong>Inquiry:</strong> {success.payload?.inquiry || ""}</div>
            </div>
            {success.note && <div className="mt-3 text-xs text-amber-400">Note: {success.note}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 text-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="grid items-start gap-12 mx-auto max-w-7xl lg:grid-cols-2">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 text-indigo-300 rounded-full bg-indigo-800/30 w-max">
            <Users className="w-4 h-4" /> Trusted by modern teams
          </div>

          <h1 className="text-4xl font-bold leading-tight">Contact Sales</h1>

          <p className="max-w-xl text-lg text-slate-300">
            Tell us about your needs — we’ll match you with the right plan and
            solutions. Whether you need enterprise security, custom integrations,
            or a pilot deployment, our team will help you get started quickly.
          </p>

          <ul className="mt-6 space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-800/20">
                <Building2 className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="font-semibold">Enterprise-ready</div>
                <div className="text-sm text-slate-400">SSO, audit logs, RBAC and SLAs.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-800/20">
                <Mail className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="font-semibold">Dedicated onboarding</div>
                <div className="text-sm text-slate-400">We'll help with setup and migration.</div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-800/20">
                <Phone className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="font-semibold">Human support</div>
                <div className="text-sm text-slate-400">Phone and email support during onboarding.</div>
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

        <section>
          <ContactForm onSuccess={handleSuccess} />
        </section>
      </div>
    </main>
  );
}
