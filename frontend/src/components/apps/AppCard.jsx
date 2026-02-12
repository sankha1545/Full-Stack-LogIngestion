// src/components/apps/AppCard.jsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  MoreHorizontal,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/**
 * =====================================================
 * Application Card (SaaS Dashboard)
 * =====================================================
 *
 * Features:
 * - open application
 * - rotate key
 * - delete app
 * - copy connection string
 * - professional SaaS UI
 */

export default function AppCard({ app, onDelete, onRotate }) {
  const navigate = useNavigate();

  /* =====================================================
     COPY CONNECTION STRING
  ===================================================== */

  async function handleCopyConnection() {
    if (!app.connectionUrl) return;

    try {
      await navigator.clipboard.writeText(app.connectionUrl);
      alert("Connection URL copied");
    } catch {
      alert("Failed to copy connection URL");
    }
  }

  /* =====================================================
     OPEN APPLICATION
  ===================================================== */

  function openApp() {
    navigate(`/applications/${app.id}`);
  }

  /* =====================================================
     ENVIRONMENT BADGE STYLE
  ===================================================== */

  function getEnvStyle(env) {
    switch (env) {
      case "PRODUCTION":
        return "bg-red-100 text-red-700";
      case "STAGING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <Card
      className="transition shadow-sm cursor-pointer hover:shadow-md"
      onClick={openApp}
    >
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between">

        <div className="space-y-1">
          <CardTitle className="text-lg">{app.name}</CardTitle>

          <span
            className={`text-xs px-2 py-1 rounded ${getEnvStyle(
              app.environment
            )}`}
          >
            {app.environment}
          </span>
        </div>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                openApp();
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </DropdownMenuItem>

            {app.connectionUrl && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyConnection();
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Connection URL
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRotate(app.id);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Rotate API Key
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(app.id);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Body */}
      <CardContent>
        <div className="space-y-1 text-xs text-muted-foreground">
          {app.connectionUrl && (
            <div className="truncate">
              {app.connectionUrl}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
