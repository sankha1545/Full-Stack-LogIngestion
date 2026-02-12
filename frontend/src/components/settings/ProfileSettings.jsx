// src/components/settings/ProfileSettings.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getProfile, updateProfile } from "@/api/profile";
import { fetchCountries, fetchStates } from "@/api/geodata";
import { useAuth } from "@/context/AuthContext";

import EditProfileModal from "@/components/profile/EditProfileModal";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Mail, MapPin, User, ShieldCheck } from "lucide-react";

export default function ProfileSettings() {
  const { user } = (() => {
    try {
      return useAuth();
    } catch {
      return { user: null };
    }
  })();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    let mounted = true;
    setLoadingProfile(true);

    getProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data || {});
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => mounted && setLoadingProfile(false));

    return () => (mounted = false);
  }, []);

  /* ================= LOAD COUNTRIES ================= */
  useEffect(() => {
    let mounted = true;
    setLoadingCountries(true);

    fetchCountries()
      .then((list) => mounted && setCountries(list || []))
      .finally(() => mounted && setLoadingCountries(false));

    return () => (mounted = false);
  }, []);

  /* ================= LOAD STATES ================= */
  useEffect(() => {
    if (!form?.countryCode) {
      setStates([]);
      return;
    }

    const country = countries.find((c) => c.code === form.countryCode);
    if (!country) return;

    let mounted = true;
    setLoadingStates(true);

    fetchStates(country.name)
      .then((list) => mounted && setStates(list || []))
      .finally(() => mounted && setLoadingStates(false));

    return () => (mounted = false);
  }, [form?.countryCode, countries]);

  function openEdit() {
    setForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      username: profile?.username || "",
      email: user?.email || profile?.email || "",
      countryCode: profile?.countryCode || "",
      country: profile?.country || "",
      state: profile?.state || "",
    });

    if (profile?.country) {
      fetchStates(profile.country).then((list) =>
        setStates(list || [])
      );
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
        country:
          countries.find((c) => c.code === form.countryCode)?.name || null,
        countryCode: form.countryCode || null,
        state: form.state || null,
      };

      await updateProfile(payload);

      setProfile((prev) => ({
        ...(prev || {}),
        ...payload,
        email: form.email || prev?.email,
      }));

      setEditOpen(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  const fullName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    "Unnamed User";

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl px-4 py-8 mx-auto space-y-8">

      {/* PROFILE HEADER */}
      <Card className="border shadow-sm rounded-2xl">
        <CardContent className="flex flex-col items-center gap-6 p-8 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-6">
            <div className="p-1 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500">
              <Avatar className="w-20 h-20 border-4 border-white">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>
                  {profile?.firstName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              {loadingProfile ? (
                <Skeleton className="w-40 h-6" />
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button onClick={openEdit} size="lg">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <Card className="border shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your personal and login details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <InfoRow icon={User} label="Username" value={profile?.username} />
            <InfoRow icon={Mail} label="Email" value={user?.email || profile?.email} />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={
                profile?.country
                  ? `${profile.country}${profile?.state ? ` — ${profile.state}` : ""}`
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card className="border shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Security & verification details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Email verified</span>
              <Badge variant="default">Yes</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Profile completeness</span>
              <Badge variant="secondary">
                {profile?.firstName ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL */}
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
        originalValues={profile}
      />
    </div>
  );
}

/* Small reusable row component */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}
