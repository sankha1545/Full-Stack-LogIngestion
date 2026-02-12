import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApp } from "@/api/appsApi";

export default function CreateAppDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("DEVELOPMENT");

  async function handleCreate() {
    const res = await createApp({ name, environment });
    alert("API Key: " + res.data.apiKey);
    onCreated();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="App Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="DEVELOPMENT">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PRODUCTION">Production</option>
          </select>

          <Button onClick={handleCreate}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
