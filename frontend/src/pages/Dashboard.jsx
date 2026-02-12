import { useEffect, useState } from "react";
import { getApps, deleteApp, rotateApiKey } from "@/api/appsApi";
import AppCard from "@/components/apps/AppCard";
import CreateAppDialog from "@/components/apps/CreateAppDialog";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [open, setOpen] = useState(false);

  async function loadApps() {
    const data = await getApps();
    setApps(data);
  }

  useEffect(() => {
    loadApps();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this app?")) return;
    await deleteApp(id);
    loadApps();
  }

  async function handleRotate(id) {
    const res = await rotateApiKey(id);
    alert("New API Key: " + res.apiKey);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Button onClick={() => setOpen(true)}>Add App</Button>
      </div>

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

      <CreateAppDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={loadApps}
      />
    </div>
  );
}
