// src/pages/Applications.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getApps, createApp, deleteApp, rotateApiKey } from "../api/appsApi";
import CreateAppModal from "../components/modal/CreateAppModal";
import AppCard from "../components/apps/AppCard";
import { useNavigate } from "react-router-dom";

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getApps();
      setApps(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function onCreate(payload) {
    try {
      const res = await createApp(payload); // returns app + apiKey
      setCreatedKey(res.apiKey); // show copy modal
      setCreating(false);
      await load();
      // optionally navigate to new app
      navigate(`/applications/${res.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create app");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this application and all its logs? This cannot be undone.")) return;
    try {
      await deleteApp(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete app");
    }
  }

  async function onRotate(id) {
    if (!confirm("Rotate API key? Old key will be revoked.")) return;
    try {
      const res = await rotateApiKey(id); // returns new apiKey
      alert("New API key shown — copy it now.");
      // show it to user (simple prompt or modal)
      prompt("New API key (store it now)", res.apiKey);
    } catch (err) {
      console.error(err);
      alert("Failed to rotate key");
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Applications</h2>
        <Button onClick={() => setCreating(true)}>Add App</Button>
      </div>

      <CreateAppModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={onCreate}
      />

      {/* Show created key once (optional modal). For simplicity we use a box */}
      {createdKey && (
        <div className="p-3 mb-4 border rounded bg-yellow-50">
          <div className="text-sm">Copy this API key — it will be shown only once:</div>
          <pre className="p-2 mt-2 overflow-auto text-xs bg-white border rounded">{createdKey}</pre>
          <div className="mt-2">
            <Button onClick={() => { navigator.clipboard.writeText(createdKey); alert("Copied"); setCreatedKey(null); }}>Copy & Done</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.map(app => (
          <AppCard
            key={app.id}
            app={app}
            onOpen={() => navigate(`/applications/${app.id}`)}
            onDelete={() => onDelete(app.id)}
            onRotate={() => onRotate(app.id)}
          />
        ))}
      </div>
    </div>
  );
}
