import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, EmptyState } from "@/components/sdlc/page-header";
import { exportJson } from "@/lib/export-utils";
import { getReports, getRecommendationColor, getRiskColor, formatTimestamp, type NormalizedReports } from "@/lib/api";
import { Download, FileBarChart2, FileDown, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — AI SDLC Guardian" }, { name: "description", content: "Executive release readiness reports." }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [data, setData] = useState<NormalizedReports | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true); setError(null);
    try {
      const d = await getReports();
      setData(d);
      toast.success("Reports loaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Failed to load Reports", { description: msg });
    } finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Reports"
          title="Executive Release Readiness Report"
          subtitle="Aggregate of latest release, top blockers, required actions, and domain-specific reports."
          actions={
            <>
              {data && <button onClick={() => exportJson(data, `reports-${Date.now()}.json`)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent"><Download className="size-4" /> Export Report JSON</button>}
              {data?.latestRelease && <button onClick={() => exportJson(data.latestRelease, `latest-release-${data.latestRelease?.releaseId}.json`)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent"><FileDown className="size-4" /> Export Latest Release</button>}
              <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow disabled:opacity-60"><RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh Report</button>
            </>
          }
        />

        {error && (
          <div className="glass rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="font-semibold">Reports request failed</div>
            <div className="text-destructive/80 mt-1 break-words">{error}</div>
          </div>
        )}

        {loading && !data ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">Loading reports…</div>
        ) : !data ? (
          <EmptyState title="No report data yet" icon={FileBarChart2} description="Run analyses to generate executive reporting data." />
        ) : (
          <>
            {/* Summary cards */}
            {Object.keys(data.summary).length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(data.summary).map(([k, v]) => (
                  <div key={k} className="glass rounded-2xl p-4 shadow-elegant">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{prettify(k)}</div>
                    <div className="text-xl font-semibold mt-1 break-words">{formatVal(v)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Domain scores */}
            {Object.keys(data.domainScores).length > 0 && (
              <div className="glass rounded-2xl p-5 shadow-elegant">
                <div className="text-sm font-semibold mb-3">Domain Scores</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(data.domainScores).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="capitalize">{prettify(k)}</span>
                        <span className="font-mono">{v}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latest release */}
            {data.latestRelease && (
              <div className="glass rounded-2xl p-5 shadow-elegant">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Latest Release Summary</div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRecommendationColor(data.latestRelease.releaseRecommendation)}`}>{data.latestRelease.releaseRecommendation.replace(/_/g, " ")}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(data.latestRelease.riskLevel)}`}>Risk {data.latestRelease.riskLevel}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat k="Release ID" v={data.latestRelease.releaseId} mono />
                  <Stat k="Confidence" v={`${data.latestRelease.releaseConfidenceScore}%`} />
                  <Stat k="Overall Risk" v={String(data.latestRelease.overallRiskScore)} />
                  <Stat k="Timestamp" v={formatTimestamp(data.latestRelease.timestamp)} />
                </div>
                {data.latestRelease.executiveSummary && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Executive Summary</div>
                    <div className="text-sm whitespace-pre-wrap">{data.latestRelease.executiveSummary}</div>
                  </div>
                )}
              </div>
            )}

            {/* Top blockers & actions */}
            <div className="grid lg:grid-cols-2 gap-3">
              <ListCard title="Top Blockers" items={data.topBlockers} />
              <ListCard title="Top Required Actions" items={data.topRequiredActions} />
            </div>

            {/* Executive Report */}
            {Object.keys(data.executiveReport).length > 0 && (
              <ReportSection title="Executive Report" content={data.executiveReport} />
            )}

            {/* Sub-reports */}
            {Object.entries(data.reports).map(([k, v]) => (
              <ReportSection key={k} title={`${prettify(k)} Report`} content={v as Record<string, unknown>} />
            ))}

            <div className="text-[11px] text-muted-foreground text-right">Generated: {formatTimestamp(data.generatedAt)}</div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ListCard({ title, items }: { title: string; items: { item: string; count: number }[] }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {items.length === 0 ? <div className="text-xs text-muted-foreground italic">None</div> : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{it.item}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/60 font-mono shrink-0">×{it.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportSection({ title, content }: { title: string; content: unknown }) {
  if (!content || typeof content !== "object") {
    return (
      <div className="glass rounded-2xl p-5 shadow-elegant">
        <div className="text-sm font-semibold mb-2">{title}</div>
        <div className="text-sm whitespace-pre-wrap">{String(content ?? "—")}</div>
      </div>
    );
  }
  const entries = Object.entries(content as Record<string, unknown>);
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant">
      <div className="text-sm font-semibold mb-3">{title}</div>
      <div className="space-y-3">
        {entries.map(([k, v]) => (
          <div key={k}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{prettify(k)}</div>
            {Array.isArray(v) ? (
              v.length === 0 ? <div className="text-xs text-muted-foreground italic">None</div> :
              <ul className="text-sm list-disc pl-5 space-y-1">{v.map((x, i) => <li key={i}>{typeof x === "string" ? x : JSON.stringify(x)}</li>)}</ul>
            ) : typeof v === "object" && v !== null ? (
              <pre className="text-xs bg-muted/40 rounded-lg p-3 overflow-x-auto">{JSON.stringify(v, null, 2)}</pre>
            ) : (
              <div className="text-sm whitespace-pre-wrap">{String(v ?? "—")}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return <div className="glass rounded-lg p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div><div className={`text-sm font-semibold mt-0.5 ${mono ? "font-mono" : ""}`}>{v}</div></div>;
}

function prettify(k: string) { return k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim(); }
function formatVal(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}
