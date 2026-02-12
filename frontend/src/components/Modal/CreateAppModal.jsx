// src/components/apps/CreateAppModal.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateAppModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [env, setEnv] = useState("DEVELOPMENT");
  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    onCreate({ name, environment: env });
    setName("");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/30">
      <div className="bg-white p-6 rounded shadow w-[520px]">
        <h3 className="mb-3 text-lg font-semibold">Create Application</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Name</label>
            <input className="w-full px-3 py-2 border rounded" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block mb-1 text-sm">Environment</label>
            <select className="w-full px-3 py-2 border rounded" value={env} onChange={e => setEnv(e.target.value)}>
              <option value="DEVELOPMENT">Development</option>
              <option value="STAGING">Staging</option>
              <option value="PRODUCTION">Production</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
