import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, EmptyState } from "@/components/sdlc/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getAIInsights, getRecommendationColor, type NormalizedInsights } from "@/lib/api";
import {
  AlertTriangle,
  RefreshCcw,
  Sparkles,
  ShieldAlert,
  Activity,
  Briefcase,
  Eye,
  HeartPulse,
  ScrollText,
  TrendingUp,
  PlayCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — AI SDLC Guardian" },
      { name: "description", content: "Executive release intelligence analytics from live backend." },
    ],
  }),
  component: InsightsPage,
});

const RISK_COLORS: Record<string, { bg: string; ring: string; text: string; label: string }> = {
  security: { bg: "bg-destructive/15", ring: "border-destructive/40", text: "text-destructive", label: "Security" },
  performance: { bg: "bg-warning/15", ring: "border-warning/40", text: "text-warning", label: "Performance" },
  business: { bg: "bg-info/15", ring: "border-info/40", text: "text-info", label: "Business" },
  observability: { bg: "bg-chart-4/15", ring: "border-chart-4/40", text: "text-chart-4", label: "Observability" },
  reliability: { bg: "bg-success/15", ring: "border-success/40", text: "text-success", label: "Reliability" },
  compliance: { bg: "bg-warning/15", ring: "border-warning/40", text: "text-warning", label: "Compliance" },
};

function healthOf(score: number) {
  if (score >= 80) return { label: "Excellent", tone: "text-success", bar: "bg-success" };
  if (score >= 60) return { label: "Good", tone: "text-info", bar: "bg-info" };
  if (score >= 40) return { label: "Warning", tone: "text-warning", bar: "bg-warning" };
  return { label: "Critical", tone: "text-destructive", bar: "bg-destructive" };
}

function InsightsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<NormalizedInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const d = await getAIInsights();
      setData(d);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Failed to load AI insights", { description: msg });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void refresh(); }, []);

  const recDist = useMemo(() => {
    if (!data) return [];
    return [
      { name: "GO", value: data.goCount, color: "hsl(var(--success))" },
      { name: "GO_WITH_RISK", value: data.goWithRiskCount, color: "hsl(var(--warning))" },
      { name: "NO_GO", value: data.noGoCount, color: "hsl(var(--destructive))" },
    ];
  }, [data]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="AI Insights"
          title="Executive Release Intelligence"
          subtitle="Real-time analytics aggregated from your release history."
          actions={
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow disabled:opacity-60"
            >
              <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          }
        />

        {error && !loading && (
          <div className="glass rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
            <AlertTriangle className="size-8 text-destructive mx-auto mb-2" />
            <div className="text-sm font-semibold text-destructive">Unable to load AI insights.</div>
            <div className="text-xs text-muted-foreground mt-1">{error}</div>
            <button
              onClick={refresh}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent"
            >
              <RefreshCcw className="size-4" /> Retry
            </button>
          </div>
        )}

        {loading && <LoadingState />}

        {!loading && !error && data && data.total === 0 && (
          <EmptyState
            title="No release history available yet."
            description="Run your first analysis to generate executive insights."
            icon={Sparkles}
            action={
              <button
                onClick={() => navigate({ to: "/" })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow"
              >
                <PlayCircle className="size-4" /> Run First Analysis
              </button>
            }
          />
        )}

        {!loading && !error && data && data.total > 0 && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiTile label="Total Releases" value={String(data.total)} icon={ScrollText} suffix="" raw />
              <KpiTile label="Avg Confidence" value={data.averageConfidence} icon={TrendingUp} />
              <KpiTile label="Avg Security" value={data.averageSecurityScore} icon={ShieldAlert} />
              <KpiTile label="Avg Performance" value={data.averagePerformanceScore} icon={Activity} />
              <KpiTile label="Avg Reliability" value={data.averageReliabilityScore} icon={HeartPulse} />
              <KpiTile label="Avg Compliance" value={data.averageComplianceScore} icon={Briefcase} />
            </div>

            {/* Recommendation analytics */}
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 glass rounded-2xl p-5 shadow-elegant">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold">Release Recommendation Distribution</div>
                    <div className="text-xs text-muted-foreground">Across {data.total} analyzed releases</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 items-center">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={recDist}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {recDist.map((d, i) => (
                            <Cell key={i} fill={d.color} stroke="hsl(var(--background))" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    <RecRow label="GO" count={data.goCount} rec="GO" total={data.total} />
                    <RecRow label="GO_WITH_RISK" count={data.goWithRiskCount} rec="GO_WITH_RISK" total={data.total} />
                    <RecRow label="NO_GO" count={data.noGoCount} rec="NO_GO" total={data.total} />
                  </div>
                </div>
              </div>

              {/* Risk Intelligence */}
              <RiskIntelCard area={data.highestRiskArea} />
            </div>

            {/* Blocker Intelligence */}
            <BlockerCard blocker={data.mostCommonBlocker} />

            {/* Historical insights */}
            <div>
              <div className="text-sm font-semibold mb-3">Historical Health Insights</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <HealthCard label="Average Confidence Trend" score={data.averageConfidence} icon={TrendingUp} />
                <HealthCard label="Security Health" score={data.averageSecurityScore} icon={ShieldAlert} />
                <HealthCard label="Reliability Health" score={data.averageReliabilityScore} icon={HeartPulse} />
                <HealthCard label="Compliance Health" score={data.averageComplianceScore} icon={Briefcase} />
              </div>
            </div>

            {/* Extra averages */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <HealthCard label="Performance Health" score={data.averagePerformanceScore} icon={Activity} />
              <HealthCard label="Business Health" score={data.averageBusinessScore} icon={Briefcase} />
              <HealthCard label="Observability Health" score={data.averageObservabilityScore} icon={Eye} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function KpiTile({
  label, value, icon: Icon, suffix = "%", raw = false,
}: { label: string; value: number | string; icon: React.ElementType; suffix?: string; raw?: boolean }) {
  const numeric = typeof value === "number" ? value : null;
  const h = numeric != null ? healthOf(numeric) : null;
  return (
    <div className="glass rounded-2xl p-4 shadow-elegant float-in">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold mt-1">
        {value}{!raw && suffix}
      </div>
      {numeric != null && h && (
        <>
          <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
            <div className={`h-full ${h.bar}`} style={{ width: `${Math.min(100, Math.max(0, numeric))}%` }} />
          </div>
          <div className={`text-[10px] mt-1 font-medium ${h.tone}`}>{h.label}</div>
        </>
      )}
    </div>
  );
}

function RecRow({ label, count, rec, total }: { label: string; count: number; rec: string; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRecommendationColor(rec)} w-32 text-center`}>
        {label.replace(/_/g, " ")}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-10 text-right">{count}</span>
      <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
    </div>
  );
}

function RiskIntelCard({ area }: { area: string }) {
  const key = String(area || "").toLowerCase();
  const meta = RISK_COLORS[key] ?? { bg: "bg-muted", ring: "border-border", text: "text-foreground", label: area || "Unknown" };
  return (
    <div className={`glass rounded-2xl p-5 shadow-elegant border ${meta.ring} ${meta.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className={`size-4 ${meta.text}`} />
        <div className="text-sm font-semibold">Highest Risk Area</div>
      </div>
      <div className={`text-3xl font-bold capitalize ${meta.text}`}>{meta.label}</div>
      <div className="mt-3">
        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${meta.ring} ${meta.text} bg-background/40`}>
          High Focus Area
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Prioritize mitigation, reviews, and testing in this domain to improve overall release confidence.
      </p>
    </div>
  );
}

function BlockerCard({ blocker }: { blocker: string }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant border border-destructive/40 bg-destructive/5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="size-4 text-destructive" />
        <div className="text-sm font-semibold">Most Common Blocker</div>
      </div>
      {blocker ? (
        <p className="text-sm leading-relaxed">{blocker}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">No common blockers identified.</p>
      )}
    </div>
  );
}

function HealthCard({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const h = healthOf(score);
  return (
    <div className="glass rounded-2xl p-4 shadow-elegant">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold">{score}</div>
        <div className={`text-xs font-medium ${h.tone}`}>{h.label}</div>
      </div>
      <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
        <div className={`h-full ${h.bar}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
