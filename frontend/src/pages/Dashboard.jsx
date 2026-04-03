import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Boxes, KeyRound, ShieldCheck, Sparkles } from "lucide-react";

import { getApps, deleteApp, rotateApiKey } from "@/api/appsApi";
import AppCard from "@/components/apps/AppCard";
import CreateAppDialog from "@/components/apps/CreateAppDialog";
import AppCredentialsDialog from "@/components/apps/AppCredentialsDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  async function loadApps() {
    try {
      setLoading(true);
      setError(null);
      const res = await getApps();
      setApps(res?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function confirmDelete() {
    try {
      await deleteApp(deleteId);
      setDeleteId(null);
      await loadApps();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRotate(id) {
    try {
      const res = await rotateApiKey(id);
      setCredentials({
        apiKey: res?.data?.apiKey,
        connectionString: res?.data?.connectionString,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreated(result) {
    setCreateOpen(false);

    if (result?.apiKey || result?.connectionString) {
      setCredentials({
        apiKey: result.apiKey,
        connectionString: result.connectionString,
      });
    }

    await loadApps();
  }

  const metrics = useMemo(() => {
    const production = apps.filter((app) => app.environment === "PRODUCTION").length;
    const staging = apps.filter((app) => app.environment === "STAGING").length;

    return [
      {
        label: "Connected applications",
        value: apps.length,
        icon: Boxes,
        tone: "bg-sky-50 text-sky-700",
      },
      {
        label: "Production apps",
        value: production,
        icon: ShieldCheck,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Staging apps",
        value: staging,
        icon: Activity,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Credentials managed",
        value: apps.length,
        icon: KeyRound,
        tone: "bg-indigo-50 text-indigo-700",
      },
    ];
  }, [apps]);

  const recentApps = apps.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.4fr_1fr] lg:p-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Product overview
            </div>
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Manage applications, credentials, and live observability from one polished workspace.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                The dashboard now highlights the actions users care about most: creating new apps, jumping into live logs,
                rotating credentials safely, and reviewing the current application footprint at a glance.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-2xl bg-white px-5 text-slate-950 hover:bg-slate-100" onClick={() => setCreateOpen(true)}>
                Create application
              </Button>
              <Button variant="outline" className="rounded-2xl border-white/20 bg-white/5 px-5 text-white hover:bg-white/10" onClick={() => navigate("/analytics") }>
                Open analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {metrics.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className={`inline-flex rounded-2xl p-3 ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm text-slate-300">{item.label}</div>
                  <div className="mt-1 text-3xl font-semibold text-white">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load applications: {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Applications</h3>
              <p className="text-sm text-slate-500">A cleaner, more standard card layout with direct access to each app.</p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/applications")}>View all</Button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">Loading applications...</div>
          ) : apps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
              No applications yet. Create your first app to start sending logs.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {apps.map((app) => (
                <AppCard key={app.id} app={app} onDelete={setDeleteId} onRotate={handleRotate} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Recent focus</h3>
            <p className="text-sm text-slate-500">Surface the most relevant apps and next actions without making users hunt.</p>
          </div>

          <div className="space-y-3">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{app.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{app.environment}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">Recent applications will appear here once created.</div>
            )}
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="text-sm font-semibold">UX upgrade highlights</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Clearer hierarchy and spacing across the dashboard shell.</li>
              <li>More actionable cards with consistent buttons and hover states.</li>
              <li>Faster access to create, rotate, inspect, and analyze flows.</li>
            </ul>
          </div>
        </div>
      </section>

      <CreateAppDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />

      <AppCredentialsDialog
        open={!!credentials}
        apiKey={credentials?.apiKey}
        connectionString={credentials?.connectionString}
        onClose={() => setCredentials(null)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Application"
        description="This will permanently delete the application and all logs."
        confirmText="Delete"
      />
    </div>
  );
}

