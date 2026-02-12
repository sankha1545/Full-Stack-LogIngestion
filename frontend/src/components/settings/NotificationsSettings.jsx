import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Webhook, Slack } from "lucide-react";

export default function NotificationsSettings() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    slackAlerts: false,
    webhookAlerts: false,
    errorSpike: true,
    downtime: true,
    weeklySummary: false,
  });

  const update = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Configure how you receive alerts and updates
        </p>
      </div>

      {/* Delivery Channels */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Delivery Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <ChannelRow
            icon={Mail}
            title="Email Alerts"
            enabled={settings.emailAlerts}
            onToggle={() => update("emailAlerts")}
          />

          <ChannelRow
            icon={Slack}
            title="Slack Integration"
            enabled={settings.slackAlerts}
            onToggle={() => update("slackAlerts")}
          />

          <ChannelRow
            icon={Webhook}
            title="Webhook"
            enabled={settings.webhookAlerts}
            onToggle={() => update("webhookAlerts")}
          />

        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <AlertRow
            label="Error spike detection"
            enabled={settings.errorSpike}
            onToggle={() => update("errorSpike")}
            badge="Critical"
          />

          <AlertRow
            label="Application downtime"
            enabled={settings.downtime}
            onToggle={() => update("downtime")}
            badge="Critical"
          />

          <AlertRow
            label="Weekly usage summary"
            enabled={settings.weeklySummary}
            onToggle={() => update("weeklySummary")}
            badge="Informational"
          />

        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg">
          Save Preferences
        </Button>
      </div>

    </div>
  );
}

function ChannelRow({ icon: Icon, title, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span>{title}</span>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

function AlertRow({ label, enabled, onToggle, badge }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span>{label}</span>
        <Badge variant="secondary">{badge}</Badge>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}
