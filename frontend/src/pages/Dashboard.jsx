// src/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { getApps, deleteApp, rotateApiKey } from "@/api/appsApi";

import AppCard from "@/components/apps/AppCard";
import CreateAppDialog from "@/components/apps/CreateAppDialog";
import AppCredentialsDialog from "@/components/apps/AppCredentialsDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import { Button } from "@/components/ui/button";



export default function Dashboard() {
  /* =====================================================
     STATE
  ===================================================== */

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // create app dialog
  const [createOpen, setCreateOpen] = useState(false);

  // credentials modal
  const [credentials, setCredentials] = useState(null);

  // delete confirm modal
  const [deleteId, setDeleteId] = useState(null);

  /* =====================================================
     LOAD APPLICATIONS
  ===================================================== */

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

  /* =====================================================
     DELETE FLOW (CONFIRM MODAL)
  ===================================================== */

  function handleDelete(id) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    try {
      await deleteApp(deleteId);
      setDeleteId(null);
      await loadApps();
    } catch (err) {
      setError(err.message);
    }
  }

  /* =====================================================
     ROTATE API KEY
  ===================================================== */

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

  /* =====================================================
     ON APP CREATED
  ===================================================== */

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

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  /* =====================================================
     ERROR STATE
  ===================================================== */

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Failed to load applications: {error}
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>

        <Button onClick={() => setCreateOpen(true)}>
          Create Application
        </Button>
      </div>

      {/* Empty State */}
      {apps.length === 0 && (
        <div className="p-12 text-center border rounded-lg text-muted-foreground">
          No applications yet.
          <br />
          Create your first app to start sending logs.
        </div>
      )}

      {/* Apps Grid */}
      {apps.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onDelete={handleDelete}
              onRotate={handleRotate}
            />
          ))}
        </div>
      )}

      {/* Create Application Dialog */}
      <CreateAppDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      {/* Credentials Modal */}
      <AppCredentialsDialog
        open={!!credentials}
        apiKey={credentials?.apiKey}
        connectionString={credentials?.connectionString}
        onClose={() => setCredentials(null)}
      />

      {/* Delete Confirmation Modal */}
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
