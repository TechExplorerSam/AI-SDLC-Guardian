import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/sdlc/page-header";
import { DEFAULT_SETTINGS, useSettings, type AppSettings } from "@/lib/settings-store";
import { setTheme } from "@/lib/theme";
import { tokenStatusFn } from "@/lib/n8n.functions";
import { CheckCircle2, RotateCcw, Save, Wifi, XCircle, CircleDashed, KeyRound } from "lucide-react";


export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — AI SDLC Guardian" }, { name: "description", content: "Configure backend APIs, organization, AI provider, notifications, and theme." }] }),
  component: SettingsPage,
});

type TestStatus = "untested" | "ok" | "fail" | "testing";
type EndpointKey = "webhookUrl" | "historyUrl" | "insightsUrl" | "reportsUrl" | "riskCenterUrl" | "healthUrl" | "releaseDetailsUrl";

const ENDPOINTS: { key: EndpointKey; label: string; method: "GET" | "POST"; suffix?: string; body?: unknown }[] = [
  { key: "webhookUrl", label: "Analyze Project", method: "POST", body: { requirement: "ping", changeSummary: "ping", testingSummary: "ping" } },
  { key: "historyUrl", label: "Release History", method: "GET" },
  { key: "insightsUrl", label: "AI Insights", method: "GET" },
  { key: "reportsUrl", label: "Reports", method: "GET" },
  { key: "riskCenterUrl", label: "Risk Center", method: "GET" },
  { key: "healthUrl", label: "Health", method: "GET" },
  { key: "releaseDetailsUrl", label: "Release Details", method: "GET", suffix: "?releaseId=ping" },
];

function SettingsPage() {
  const [saved, save] = useSettings();
  const [draft, setDraft] = useState<AppSettings>(saved);
  const [status, setStatus] = useState<Record<EndpointKey, TestStatus>>({
    webhookUrl: "untested", historyUrl: "untested", insightsUrl: "untested",
    reportsUrl: "untested", riskCenterUrl: "untested", healthUrl: "untested", releaseDetailsUrl: "untested",
  });
  const [tokenConfigured, setTokenConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    tokenStatusFn().then((r) => { if (!cancelled) setTokenConfigured(Boolean(r?.configured)); }).catch(() => { if (!cancelled) setTokenConfigured(false); });
    return () => { cancelled = true; };
  }, []);


  function update<K extends keyof AppSettings>(k: K, v: AppSettings[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function onSave() { save(draft); setTheme(draft.theme); toast.success("Settings saved"); }
  function onReset() { setDraft(DEFAULT_SETTINGS); save(DEFAULT_SETTINGS); setTheme(DEFAULT_SETTINGS.theme); toast.success("Settings reset to defaults"); }

  async function test(ep: typeof ENDPOINTS[number]) {
    setStatus((s) => ({ ...s, [ep.key]: "testing" }));
    try {
      const mod = await import("@/lib/n8n.functions");
      switch (ep.key) {
        case "webhookUrl": await mod.analyzeProjectFn({ data: { requirement: "ping", changeSummary: "ping", testingSummary: "ping" } }); break;
        case "historyUrl": await mod.releaseHistoryFn(); break;
        case "insightsUrl": await mod.aiInsightsFn(); break;
        case "reportsUrl": await mod.reportsFn(); break;
        case "riskCenterUrl": await mod.riskCenterFn(); break;
        case "healthUrl": await mod.healthFn(); break;
        case "releaseDetailsUrl": await mod.releaseDetailsFn({ data: { releaseId: "ping" } }); break;
      }
      setStatus((s) => ({ ...s, [ep.key]: "ok" }));
      toast.success(`${ep.label} OK`);
    } catch (e) {
      setStatus((s) => ({ ...s, [ep.key]: "fail" }));
      toast.error(`${ep.label} failed`, { description: e instanceof Error ? e.message : "Network error" });
    }
  }


  async function testAll() { for (const ep of ENDPOINTS) await test(ep); }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Settings"
          title="Workspace Configuration"
          subtitle="Manage backend APIs, organization, AI provider, notifications, and appearance."
          actions={
            <>
              <button onClick={onReset} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent"><RotateCcw className="size-4" /> Reset</button>
              <button onClick={onSave} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow"><Save className="size-4" /> Save</button>
            </>
          }
        />

        <Section title="General">
          <Field label="Organization Name"><Input value={draft.organizationName} onChange={(v) => update("organizationName", v)} /></Field>
          <Field label="Environment"><Select value={draft.environment} onChange={(v) => update("environment", v as AppSettings["environment"])} options={["development", "staging", "production"]} /></Field>
          <Field label="Timezone"><Input value={draft.timezone} onChange={(v) => update("timezone", v)} /></Field>
        </Section>

        <Section title="AI Provider">
          <Field label="Model Provider"><Select value={draft.aiProvider} onChange={(v) => update("aiProvider", v as AppSettings["aiProvider"])} options={["openai", "anthropic", "gemini", "lovable"]} /></Field>
          <Field label="Model Name"><Input value={draft.aiModel} onChange={(v) => update("aiModel", v)} /></Field>
          <Field label={`Confidence Threshold: ${draft.confidenceThreshold}%`}>
            <input type="range" min={0} max={100} value={draft.confidenceThreshold} onChange={(e) => update("confidenceThreshold", Number(e.target.value))} className="w-full accent-[color:var(--color-primary)]" />
          </Field>
        </Section>

        <Section title="Backend Authentication">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <KeyRound className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">Secure Backend Access</div>
                <div className="text-[11px] text-muted-foreground">Backend authentication is configured securely on the server.</div>
              </div>
            </div>
            {tokenConfigured === null ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border text-muted-foreground border-border bg-muted"><CircleDashed className="size-3 animate-spin" /> Checking</span>
            ) : tokenConfigured ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border text-success border-success/40 bg-success/15"><CheckCircle2 className="size-3" /> Configured</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border text-destructive border-destructive/40 bg-destructive/15"><XCircle className="size-3" /> Not Configured</span>
            )}
          </div>
        </Section>

        <Section title="Backend API Endpoints">

          <div className="flex justify-end mb-1">
            <button onClick={testAll} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md glass hover:bg-accent"><Wifi className="size-3.5" /> Test All</button>
          </div>
          {ENDPOINTS.map((ep) => (
            <div key={ep.key} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ep.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{ep.method}</span>
                </div>
                <StatusBadge status={status[ep.key]} />
              </div>
              <div className="flex gap-2">
                <Input value={draft[ep.key] as string} onChange={(v) => update(ep.key, v as AppSettings[typeof ep.key])} />
                <button onClick={() => test(ep)} disabled={status[ep.key] === "testing"} className="shrink-0 inline-flex items-center gap-1.5 px-3 rounded-lg glass text-xs hover:bg-accent disabled:opacity-50">
                  <Wifi className="size-3.5" /> {status[ep.key] === "testing" ? "Testing…" : "Test"}
                </button>
              </div>
            </div>
          ))}
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <Field label="API Timeout (ms)"><Input type="number" value={String(draft.apiTimeoutMs)} onChange={(v) => update("apiTimeoutMs", Number(v) || 0)} /></Field>
            <Field label="Retry Count"><Input type="number" value={String(draft.retryCount)} onChange={(v) => update("retryCount", Number(v) || 0)} /></Field>
          </div>
        </Section>

        <Section title="Notifications">
          <Toggle label="Email Notifications" checked={draft.emailNotifications} onChange={(v) => update("emailNotifications", v)} />
          <Toggle label="Release Alerts" checked={draft.releaseAlerts} onChange={(v) => update("releaseAlerts", v)} />
          <Toggle label="Risk Alerts" checked={draft.riskAlerts} onChange={(v) => update("riskAlerts", v)} />
        </Section>

        <Section title="Theme">
          <div className="grid grid-cols-3 gap-2">
            {(["dark", "light", "system"] as const).map((t) => (
              <button key={t} onClick={() => { update("theme", t); setTheme(t); }} className={`px-3 py-2 rounded-lg text-sm capitalize transition ${draft.theme === t ? "gradient-primary text-primary-foreground shadow-glow" : "glass hover:bg-accent"}`}>{t}</button>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: TestStatus }) {
  if (status === "ok") return <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border text-success border-success/40 bg-success/15"><CheckCircle2 className="size-3" /> Connected</span>;
  if (status === "fail") return <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border text-destructive border-destructive/40 bg-destructive/15"><XCircle className="size-3" /> Failed</span>;
  if (status === "testing") return <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border text-warning border-warning/40 bg-warning/15"><CircleDashed className="size-3 animate-spin" /> Testing</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border text-muted-foreground border-border bg-muted">Untested</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[11px] text-muted-foreground mb-1.5">{label}</label>{children}</div>;
}
function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-9 px-3 rounded-lg bg-muted/60 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/50" />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-9 px-2 rounded-lg bg-muted/60 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/50">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={`w-10 h-6 rounded-full transition relative ${checked ? "bg-primary" : "bg-muted"}`} aria-checked={checked} role="switch">
        <span className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}
