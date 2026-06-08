import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, EmptyState } from "@/components/sdlc/page-header";
import { exportJson } from "@/lib/export-utils";
import { getRiskCenter, getRecommendationColor, getRiskColor, formatTimestamp, loadLatestAnalysis, type NormalizedRiskCenter, type NormalizedAnalysis } from "@/lib/api";
import { AlertTriangle, Download, RefreshCcw, ShieldAlert, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/risks")({
  head: () => ({ meta: [{ title: "Risk Center — AI SDLC Guardian" }, { name: "description", content: "Enterprise risk aggregation across all releases." }] }),
  component: RisksPage,
});

const LEVELS = ["LOW", "MEDIUM", "HIGH", "UNKNOWN"] as const;
const DEFAULT_DOMAINS = ["security", "performance", "business", "observability", "reliability", "compliance"];

function RisksPage() {
  const [data, setData] = useState<NormalizedRiskCenter | null>(null);
  const [latest, setLatest] = useState<NormalizedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true); setError(null);
    try {
      const d = await getRiskCenter();
      setData(d);
      toast.success("Risk Center loaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Failed to load Risk Center", { description: msg });
    } finally { setLoading(false); }
  }

  useEffect(() => {
    void refresh();
    setLatest(loadLatestAnalysis());
    const fn = (e: Event) => setLatest((e as CustomEvent<NormalizedAnalysis>).detail);
    globalThis.addEventListener("sdlc:latest", fn);
    return () => globalThis.removeEventListener("sdlc:latest", fn);
  }, []);

  const summary = data?.summary;
  const domains = data && Object.keys(data.domainRiskBreakdown).length > 0 ? Object.keys(data.domainRiskBreakdown) : DEFAULT_DOMAINS;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Risk Center"
          title="Enterprise Risk Aggregation"
          subtitle="Live risk posture across security, performance, business, observability, reliability, and compliance."
          actions={
            <>
              {data && <button onClick={() => exportJson(data, `risk-center-${Date.now()}.json`)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent"><Download className="size-4" /> Export JSON</button>}
              <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow disabled:opacity-60"><RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
            </>
          }
        />

        {error && (
          <div className="glass rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="font-semibold">Risk Center request failed</div>
            <div className="text-destructive/80 mt-1 break-words">{error}</div>
          </div>
        )}

        {loading && !data ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Loading risk aggregation…</div>
        ) : !data ? (
          <EmptyState title="No risk aggregation data yet" icon={ShieldCheck} description="Run analyses to populate the Risk Center." />
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard label="Total Releases" value={summary?.totalReleases ?? 0} />
              <SummaryCard label="Total Risks" value={summary?.totalRisks ?? 0} />
              <SummaryCard label="High Risk Releases" value={summary?.highRiskReleases ?? 0} tone="HIGH" />
              <SummaryCard label="Medium Risk Releases" value={summary?.mediumRiskReleases ?? 0} tone="MEDIUM" />
              <SummaryCard label="Low Risk Releases" value={summary?.lowRiskReleases ?? 0} tone="LOW" />
              <SummaryCard label="NO_GO" value={summary?.noGoReleases ?? 0} tone="HIGH" />
              <SummaryCard label="GO_WITH_RISK" value={summary?.goWithRiskReleases ?? 0} tone="MEDIUM" />
              <SummaryCard label="GO" value={summary?.goReleases ?? 0} tone="LOW" />
            </div>

            {/* Domain heatmap */}
            <div className="glass rounded-2xl p-5 shadow-elegant">
              <div className="flex items-center gap-2 mb-3"><ShieldAlert className="size-4 text-primary" /><div className="text-sm font-semibold">Domain Risk Heatmap</div></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="text-left py-2 pr-3">Domain</th>
                      {LEVELS.map((l) => <th key={l} className="py-2 px-3">{l}</th>)}
                      <th className="py-2 px-3">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((d) => {
                      const row = data.domainRiskBreakdown[d] ?? {};
                      return (
                        <tr key={d} className="border-t border-border">
                          <td className="py-2 pr-3 font-medium capitalize">{d}</td>
                          {LEVELS.map((l) => <td key={l} className="py-2 px-3"><HeatCell n={Number(row[l] ?? 0)} tone={l} /></td>)}
                          <td className="py-2 px-3 font-mono text-xs">{row.averageScore != null ? `${row.averageScore}` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top blockers & actions */}
            <div className="grid lg:grid-cols-2 gap-3">
              <ListCard title="Top Blockers" items={data.topBlockers} tone="destructive" />
              <ListCard title="Top Required Actions" items={data.topRequiredActions} tone="warning" />
            </div>

            {/* Recent high risk */}
            {data.recentHighRiskReleases.length > 0 && (
              <div className="glass rounded-2xl p-5 shadow-elegant">
                <div className="text-sm font-semibold mb-3">Recent High-Risk Releases</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="text-left py-2 pr-3">Release ID</th>
                        <th className="text-left py-2 px-3">Timestamp</th>
                        <th className="text-right py-2 px-3">Risk</th>
                        <th className="text-left py-2 px-3">Level</th>
                        <th className="text-left py-2 px-3">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.recentHighRiskReleases.map((r) => (
                        <tr key={r.releaseId}>
                          <td className="py-2 pr-3 font-mono text-xs">{r.releaseId}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{formatTimestamp(r.timestamp)}</td>
                          <td className="py-2 px-3 text-right font-mono">{r.overallRiskScore}</td>
                          <td className="py-2 px-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(r.riskLevel)}`}>{r.riskLevel}</span></td>
                          <td className="py-2 px-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRecommendationColor(r.releaseRecommendation)}`}>{r.releaseRecommendation.replace(/_/g, " ")}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Critical items */}
            {data.criticalRiskItems.length > 0 && (
              <div className="glass rounded-2xl p-5 shadow-elegant">
                <div className="flex items-center gap-2 mb-3"><AlertTriangle className="size-4 text-destructive" /><div className="text-sm font-semibold">Critical Risk Items</div></div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {data.criticalRiskItems.map((c, i) => (
                    <div key={i} className="glass rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {c.level && <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(c.level)}`}>{c.level}</span>}
                        {c.domain && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.domain}</span>}
                      </div>
                      <div className="text-sm font-medium">{c.title || c.description || "—"}</div>
                      {c.releaseId && <div className="text-[10px] font-mono text-muted-foreground mt-1">{c.releaseId}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latest analysis quick view */}
            {latest && (
              <div className="glass rounded-2xl p-5 shadow-elegant">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Latest Analysis — Domain Risks</div>
                  <div className="text-xs text-muted-foreground font-mono">{latest.releaseId}</div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
                  {[
                    ["Security", latest.securityRiskLevel, latest.securityScore],
                    ["Performance", latest.performanceRiskLevel, latest.performanceScore],
                    ["Business", latest.businessRiskLevel, latest.businessScore],
                    ["Observability", latest.observabilityRiskLevel, latest.observabilityScore],
                    ["Reliability", latest.reliabilityRiskLevel, latest.reliabilityScore],
                    ["Compliance", latest.complianceRiskLevel, latest.complianceScore],
                  ].map(([label, lvl, score]) => (
                    <div key={String(label)} className="glass rounded-xl p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label as string}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="text-xl font-semibold">{score as number}</div>
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-full border ${getRiskColor(String(lvl))}`}>{String(lvl)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[11px] text-muted-foreground text-right">Generated: {formatTimestamp(data.generatedAt)}</div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: "LOW" | "MEDIUM" | "HIGH" }) {
  const ring = tone === "HIGH" ? "ring-destructive/40" : tone === "MEDIUM" ? "ring-warning/40" : tone === "LOW" ? "ring-success/40" : "ring-border";
  return (
    <div className={`glass rounded-2xl p-4 shadow-elegant ring-1 ${ring}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function ListCard({ title, items, tone }: { title: string; items: { item: string; count: number }[]; tone: "destructive" | "warning" }) {
  const badge = tone === "destructive"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : "bg-warning/15 text-warning border-warning/30";
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {items.length === 0 ? <div className="text-xs text-muted-foreground italic">None</div> : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{it.item}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono shrink-0 ${badge}`}>×{it.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HeatCell({ n, tone }: { n: number; tone: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" }) {
  const cls = tone === "HIGH" ? "bg-destructive/20 text-destructive" : tone === "MEDIUM" ? "bg-warning/20 text-warning" : tone === "LOW" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground";
  const intensity = Math.min(1, n / 5);
  return <div className={`h-9 rounded-lg grid place-items-center text-sm font-semibold ${cls}`} style={{ opacity: 0.4 + intensity * 0.6 }}>{n}</div>;
}
