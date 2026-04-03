import { useNavigate } from "react-router-dom";
import { Activity, Copy, ExternalLink, MoreHorizontal, RefreshCw, Server, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getEnvStyle(env) {
  switch (env) {
    case "PRODUCTION":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "STAGING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-sky-50 text-sky-700 border-sky-200";
  }
}

export default function AppCard({ app, onDelete, onRotate }) {
  const navigate = useNavigate();

  async function handleCopyConnection() {
    if (!app.connectionUrl) return;

    try {
      await navigator.clipboard.writeText(app.connectionUrl);
    } catch {
      console.error("Failed to copy connection URL");
    }
  }

  function openApp() {
    navigate(`/applications/${app.id}`);
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden rounded-[24px] border-slate-200 bg-white/95 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
      onClick={openApp}
    >
      <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />

      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="space-y-3">
          <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getEnvStyle(app.environment)}`}>
            {app.environment}
          </div>
          <div>
            <CardTitle className="text-xl text-slate-950">{app.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Live logs, analytics, and credentials in one place.</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl border border-slate-200 bg-white"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 p-2">
            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); openApp(); }} className="rounded-xl">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open application
            </DropdownMenuItem>

            {app.connectionUrl && (
              <DropdownMenuItem onClick={(event) => { event.stopPropagation(); handleCopyConnection(); }} className="rounded-xl">
                <Copy className="mr-2 h-4 w-4" />
                Copy connection URL
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={(event) => { event.stopPropagation(); onRotate(app.id); }} className="rounded-xl">
              <RefreshCw className="mr-2 h-4 w-4" />
              Rotate API key
            </DropdownMenuItem>

            <DropdownMenuItem
              className="rounded-xl text-red-600 focus:text-red-600"
              onClick={(event) => { event.stopPropagation(); onDelete(app.id); }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete application
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile icon={Activity} label="Status" value="Ready for monitoring" />
          <InfoTile icon={Server} label="Ingestion" value="Connection available" />
        </div>

        {app.connectionUrl && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <div className="mb-1 font-medium text-slate-700">Connection URL</div>
            <div className="truncate">{app.connectionUrl}</div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Open the app to review logs, analytics, and live events.</span>
          <Button className="rounded-2xl" onClick={(event) => { event.stopPropagation(); openApp(); }}>
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

