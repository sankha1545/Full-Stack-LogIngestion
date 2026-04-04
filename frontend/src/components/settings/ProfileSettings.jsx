import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, MapPin, ShieldCheck, Sparkles, User } from "lucide-react";

import { updateProfile } from "@/api/profile";
import { fetchCountries, fetchStates } from "@/api/geodata";
import { useAuth } from "@/context/AuthContext";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSettings() {
  const { user, refreshUser, hydrating } = useAuth();
  const profile = user?.profile || {};

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingCountries(true);

    fetchCountries()
      .then((list) => mounted && setCountries(list || []))
      .finally(() => mounted && setLoadingCountries(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form?.countryCode) {
      setStates([]);
      return;
    }

    const country = countries.find((item) => item.code === form.countryCode);
    if (!country) return;

    let mounted = true;
    setLoadingStates(true);

    fetchStates(country.name)
      .then((list) => mounted && setStates(list || []))
      .finally(() => mounted && setLoadingStates(false));

    return () => {
      mounted = false;
    };
  }, [countries, form?.countryCode]);

  function openEdit() {
    setForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",
      countryCode: profile?.countryCode || "",
      state: profile?.state || "",
    });

    if (profile?.country) {
      fetchStates(profile.country).then((list) => setStates(list || []));
    }

    setEditOpen(true);
  }

  async function handleSave() {
    setSaving(true);

    try {
      const payload = {
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        username: form.username || null,
        country: countries.find((item) => item.code === form.countryCode)?.name || null,
        countryCode: form.countryCode || null,
        state: form.state || null,
      };

      await updateProfile(payload);
      await refreshUser();
      setEditOpen(false);
      toast.success("Your profile saved successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Unnamed User";
  const location = profile?.country ? `${profile.country}${profile?.state ? `, ${profile.state}` : ""}` : "Not set";
  const initials = `${profile?.firstName?.[0] || user?.username?.[0] || "U"}${profile?.lastName?.[0] || ""}`.toUpperCase();

  if (hydrating) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm dark:border-slate-800 dark:from-slate-950 dark:to-slate-900 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
        <CardContent className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-gradient-to-br from-sky-500 to-blue-600 p-1.5 shadow-lg shadow-sky-100">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                Account profile
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{fullName}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <ShieldCheck className="h-3 w-3" />
                  Verified user
                </Badge>
              </div>
            </div>
          </div>

          <Button onClick={openEdit} size="lg" className="rounded-2xl px-5">
            Edit profile
          </Button>
        </CardContent>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[28px] border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
          <CardHeader>
            <CardTitle>Account information</CardTitle>
            <CardDescription>Your core identity details in a cleaner summary layout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={User} label="Username" value={user?.username || "Not set"} />
            <InfoRow icon={Mail} label="Email" value={user?.email || "Not set"} />
            <InfoRow icon={MapPin} label="Location" value={location} />
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
          <CardHeader>
            <CardTitle>Profile status</CardTitle>
            <CardDescription>Quick account signals users expect in a standard settings page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow label="Email verified" value="Yes" tone="emerald" />
            <StatusRow label="Profile completeness" value={profile?.firstName ? "Complete" : "Needs attention"} tone={profile?.firstName ? "sky" : "amber"} />
            <StatusRow label="Edit access" value="Available" tone="slate" />
          </CardContent>
        </Card>
      </div>

      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        saving={saving}
        countries={countries}
        states={states}
        loadingCountries={loadingCountries}
        loadingStates={loadingStates}
        originalValues={{ ...profile, username: user?.username }}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-slate-800 dark:shadow-none">
          <Icon className="h-4 w-4" />
        </div>
        <span>{label}</span>
      </div>
      <div className="font-medium text-slate-950 dark:text-slate-100">{value}</div>
    </div>
  );
}

function StatusRow({ label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{value}</span>
    </div>
  );
}
