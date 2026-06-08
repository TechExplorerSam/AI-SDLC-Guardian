import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/sdlc/page-header";
import { useSettings } from "@/lib/settings-store";
import { User, Mail, Building2, Shield, Clock } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SDLC Guardian" },
      { name: "description", content: "User profile and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [settings] = useSettings();
  const user = {
    name: "Alex Guardian",
    email: "alex@acme.com",
    role: "Release Manager",
    org: settings.organizationName,
    lastLogin: new Date().toLocaleString(),
  };
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Account"
          title="Profile"
          subtitle="Your account, organization and preferences."
        />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-6 shadow-elegant md:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="size-20 rounded-full gradient-primary grid place-items-center text-2xl font-semibold text-primary-foreground">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="mt-3 font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 shadow-elegant md:col-span-2 space-y-3">
            <Row icon={Mail} label="Email" value={user.email} />
            <Row icon={Building2} label="Organization" value={user.org} />
            <Row icon={Shield} label="Role" value={user.role} />
            <Row icon={Clock} label="Last login" value={user.lastLogin} />
            <Row icon={User} label="Environment" value={settings.environment} />
          </div>
        </div>
        <div className="glass rounded-2xl p-6 shadow-elegant">
          <div className="text-sm font-semibold mb-3">Preferences</div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <PrefRow label="Theme" value={settings.theme} />
            <PrefRow label="AI provider" value={settings.aiProvider} />
            <PrefRow label="AI model" value={settings.aiModel} />
            <PrefRow label="Confidence threshold" value={`${settings.confidenceThreshold}%`} />
            <PrefRow label="Email alerts" value={settings.emailNotifications ? "On" : "Off"} />
            <PrefRow label="Release alerts" value={settings.releaseAlerts ? "On" : "Off"} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="size-9 rounded-lg glass grid place-items-center"><Icon className="size-4 text-muted-foreground" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

function PrefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
