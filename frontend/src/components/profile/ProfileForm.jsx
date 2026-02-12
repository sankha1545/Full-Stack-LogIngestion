// src/components/profile/ProfileForm.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfileForm({
  values,
  onChange,
  countries = [],
  states = [],
  loadingCountries = false,
  loadingStates = false,
}) {
  return (
    <div className="space-y-6">
      {/* names */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 text-sm font-medium">First name</label>
          <Input
            value={values.firstName || ""}
            onChange={(e) => onChange("firstName", e.target.value)}
            placeholder="First name"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Last name</label>
          <Input
            value={values.lastName || ""}
            onChange={(e) => onChange("lastName", e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      {/* username */}
      <div>
        <label className="block mb-1 text-sm font-medium">Username</label>
        <Input
          value={values.username || ""}
          onChange={(e) => onChange("username", e.target.value)}
          placeholder="Username"
        />
      </div>

      {/* email (non-editable) */}
      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <Input value={values.email || ""} disabled />
        <p className="mt-1 text-xs text-muted-foreground">
          Email is managed by your authentication provider and cannot be changed here.
        </p>
      </div>

      {/* country & state */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 text-sm font-medium">Country</label>
          <Select
            value={values.countryCode || ""}
            onValueChange={(code) => onChange("countryCode", code)}
            disabled={loadingCountries}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingCountries ? "Loading…" : "Select country"} />
            </SelectTrigger>

            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">State / Region</label>
          <Select
            value={values.state || ""}
            onValueChange={(v) => onChange("state", v)}
            disabled={!values.countryCode || loadingStates || states.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={!values.countryCode ? "Select country first" : loadingStates ? "Loading…" : states.length === 0 ? "No regions" : "Select state"} />
            </SelectTrigger>

            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
