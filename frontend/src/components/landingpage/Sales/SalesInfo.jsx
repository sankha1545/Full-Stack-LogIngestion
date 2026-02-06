// src/components/SalesInfo.jsx
import React from "react";
import { Users, Building2, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function SalesInfo() {
  return (
    <aside className="space-y-6">
      <div className="inline-flex items-center gap-3 px-3 py-1 text-indigo-300 rounded-full bg-indigo-900/20 w-max">
        <Users className="w-4 h-4" /> Trusted by modern teams
      </div>

      <h1 className="text-4xl font-bold leading-tight text-white">
        Contact Sales
      </h1>

      <p className="max-w-xl text-lg text-indigo-200">
        Tell us about your needs — we’ll match you with the right plan and
        solutions. Enterprise security, custom integrations, and pilot deployments available.
      </p>

      <ul className="mt-6 space-y-4 text-indigo-100/80">
        <li className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-900/10">
            <Building2 className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="font-semibold text-white">Enterprise-ready</div>
            <div className="text-sm text-indigo-200">SSO, audit logs, RBAC and SLAs.</div>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-900/10">
            <Mail className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="font-semibold text-white">Dedicated onboarding</div>
            <div className="text-sm text-indigo-200">We'll help with setup & migration.</div>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-900/10">
            <Phone className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="font-semibold text-white">Human support</div>
            <div className="text-sm text-indigo-200">Phone and email support during onboarding.</div>
          </div>
        </li>
      </ul>

      <div className="mt-8">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop"
          alt="Sales support"
          className="object-cover w-full shadow-2xl rounded-2xl max-h-96"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Link to="/signup" className="inline-flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500">
          Try free
        </Link>

        <a href="/docs" className="inline-flex items-center gap-2 px-4 py-2 text-indigo-100 rounded-lg bg-white/5 hover:bg-white/10">
          Read docs
        </a>
      </div>
    </aside>
  );
}
