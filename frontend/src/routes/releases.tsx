import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, EmptyState } from "@/components/sdlc/page-header";
import { exportJson } from "@/lib/export-utils";
import {
  getReleaseHistory,
  getReleaseDetails,
  getRecommendationColor,
  getRiskColor,
  formatTimestamp,
  type NormalizedAnalysis,
} from "@/lib/api";
import { Download, History, RefreshCcw, Search, X } from "lucide-react";

export const Route = createFileRoute("/releases")({
  head: () => ({ meta: [{ title: "Release History — AI SDLC Guardian" }, { name: "description", content: "Live MongoDB-backed release history with full analysis details." }] }),
  component: ReleaseHistoryPage,
});

function ReleaseHistoryPage() {
  const [data, setData] = useState<NormalizedAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("ALL");
  const [rec, setRec] = useState("ALL");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<NormalizedAnalysis | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const h = await getReleaseHistory();
      setData(h.releases);
      if (h.total === 0) toast.message("No release history yet");
      else toast.success(`Loaded ${h.total} releases`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Failed to load history", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) =>
      (level === "ALL" || r.riskLevel === level)
      && (rec === "ALL" || r.releaseRecommendation === rec)
      && (!q || `${r.releaseId} ${r.riskLevel} ${r.releaseRecommendation}`.toLowerCase().includes(q))
    );
  }, [data, level, rec, search]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Release History"
          title="MongoDB Release Records"
          subtitle="Search, filter, and inspect every release decision returned by the backend."
          actions={
            <>
              <button onClick={() => exportJson(filtered, `releases-${Date.now()}.json`)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent"><Download className="size-4" /> Export JSON</button>
              <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow disabled:opacity-60"><RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh History</button>
            </>
          }
        />

        <div className="glass rounded-2xl p-4 shadow-elegant grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="releaseId, risk level, recommendation…" className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/60 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/50" />
            </div>
          </div>
          <Select label="Risk Level" value={level} onChange={setLevel} options={["ALL", "LOW", "MEDIUM", "HIGH"]} />
          <Select label="Recommendation" value={rec} onChange={setRec} options={["ALL", "GO", "GO_WITH_RISK", "NO_GO"]} />
        </div>

        {error && (
          <div className="glass rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="font-semibold">History request failed</div>
            <div className="text-destructive/80 mt-1 break-words">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="glass rounded-2xl shadow-elegant p-8 text-center text-sm text-muted-foreground">Loading release history…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No releases match your filters" icon={History} description="Try clearing filters or run a new analysis to populate history." />
        ) : (
          <div className="glass rounded-2xl shadow-elegant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-3">Release ID</th>
                    <th className="text-left py-3 px-3">Timestamp</th>
                    <th className="text-right py-3 px-3">Confidence</th>
                    <th className="text-right py-3 px-3">Risk</th>
                    <th className="text-left py-3 px-3">Risk Level</th>
                    <th className="text-left py-3 px-3">Recommendation</th>
                    <th className="text-right py-3 px-3">Sec</th>
                    <th className="text-right py-3 px-3">Perf</th>
                    <th className="text-right py-3 px-3">Biz</th>
                    <th className="text-right py-3 px-3">Obs</th>
                    <th className="text-right py-3 px-3">Rel</th>
                    <th className="text-right py-3 px-3">Comp</th>
                    <th className="text-right py-3 px-3">Blk</th>
                    <th className="text-right py-3 px-3">Act</th>
                    <th className="text-right py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.releaseId} className="hover:bg-accent/30 transition">
                      <td className="py-2.5 px-3 font-mono text-xs">{r.releaseId}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-xs">{formatTimestamp(r.timestamp)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.releaseConfidenceScore}%</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.overallRiskScore}</td>
                      <td className="py-2.5 px-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(r.riskLevel)}`}>{r.riskLevel}</span></td>
                      <td className="py-2.5 px-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRecommendationColor(r.releaseRecommendation)}`}>{r.releaseRecommendation.replace(/_/g, " ")}</span></td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.securityScore}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.performanceScore}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.businessScore}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.observabilityScore}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.reliabilityScore}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.complianceScore}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.totalBlockers}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.totalActions}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button onClick={async () => {
                          setActive(r);
                          try {
                            const detail = await getReleaseDetails(r.releaseId);
                            setActive(detail);
                          } catch (e) {
                            toast.error("Failed to load details", { description: e instanceof Error ? e.message : "Unknown error" });
                          }
                        }} className="text-xs px-2 py-1 rounded-md glass hover:bg-accent">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setActive(null)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div className="relative ml-auto w-full max-w-xl h-full glass-strong border-l border-border p-6 overflow-y-auto shadow-elegant" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{active.releaseId}</div>
                <h2 className="text-lg font-semibold">Release Detail</h2>
                <div className="text-xs text-muted-foreground">{formatTimestamp(active.timestamp)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportJson(active, `${active.releaseId}.json`)} className="size-8 grid place-items-center rounded-lg glass hover:bg-accent" title="Export JSON"><Download className="size-4" /></button>
                <button onClick={() => setActive(null)} className="size-8 grid place-items-center rounded-lg glass hover:bg-accent"><X className="size-4" /></button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRecommendationColor(active.releaseRecommendation)}`}>{active.releaseRecommendation.replace(/_/g, " ")}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(active.riskLevel)}`}>Risk {active.riskLevel}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat k="Confidence" v={`${active.releaseConfidenceScore}%`} />
              <Stat k="Overall Risk" v={String(active.overallRiskScore)} />
              <Stat k="Total Blockers" v={String(active.totalBlockers)} />
              <Stat k="Total Actions" v={String(active.totalActions)} />
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Specialist Scores</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Security", active.securityScore, active.securityRiskLevel],
                  ["Performance", active.performanceScore, active.performanceRiskLevel],
                  ["Business", active.businessScore, active.businessRiskLevel],
                  ["Observability", active.observabilityScore, active.observabilityRiskLevel],
                  ["Reliability", active.reliabilityScore, active.reliabilityRiskLevel],
                  ["Compliance", active.complianceScore, active.complianceRiskLevel],
                ].map(([label, score, lvl]) => (
                  <div key={String(label)} className="glass rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{label as string}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full border ${getRiskColor(String(lvl))}`}>{String(lvl)}</span>
                    </div>
                    <div className="text-lg font-semibold mt-1">{score as number}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Release Metrics</div>
              <div className="space-y-1.5">
                {Object.entries(active.releaseMetrics).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs"><span className="capitalize">{k.replace(/Readiness$/, "")}</span><span className="font-mono">{v}%</span></div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Executive Summary</div>
              <div className="text-sm whitespace-pre-wrap">{active.executiveSummary || <span className="text-muted-foreground italic">No summary provided.</span>}</div>
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Critical Blockers</div>
              {active.criticalBlockers.length === 0 ? <div className="text-xs text-muted-foreground italic">None</div> : (
                <ul className="text-sm space-y-1 list-disc pl-5">{active.criticalBlockers.map((b, i) => <li key={i}>{b}</li>)}</ul>
              )}
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Required Actions</div>
              {active.requiredActions.length === 0 ? <div className="text-xs text-muted-foreground italic">None</div> : (
                <ul className="text-sm space-y-1 list-disc pl-5">{active.requiredActions.map((a, i) => <li key={i}>{a}</li>)}</ul>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return <div className="glass rounded-lg p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div><div className="text-base font-semibold mt-0.5">{v}</div></div>;
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div><label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-9 px-2 rounded-lg bg-muted/60 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/50">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
