import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { InputPanel } from "@/components/sdlc/input-panel";
import { RiskCard } from "@/components/sdlc/risk-card";
import { ReleaseDecision } from "@/components/sdlc/release-decision";
import { AiInsights } from "@/components/sdlc/ai-insights";
import { SdlcCharts } from "@/components/sdlc/sdlc-charts";
import { StakeholderView } from "@/components/sdlc/stakeholder-view";
import { ExecutiveSummaryCard } from "@/components/sdlc/executive-summary";
import { CriticalBlockersCard } from "@/components/sdlc/critical-blockers";
import { RequiredActionsCard } from "@/components/sdlc/required-actions";
import { SecurityIntelligence } from "@/components/sdlc/security-intel";
import { ScoreOverview } from "@/components/sdlc/score-overview";
import { RiskMatrix } from "@/components/sdlc/risk-matrix";
import { DashboardSkeleton } from "@/components/sdlc/dashboard-skeleton";
import { MOCK_RESULT, generateMockFromInputs, type AnalysisResult, type RiskLevel } from "@/lib/sdlc-data";
import { saveAssessment, exportPdf } from "@/lib/assessment-utils";
import { exportJson } from "@/lib/export-utils";
import { TrendChartCard } from "@/components/sdlc/trend-charts";
import { RELEASE_TREND, RISK_TREND, SECURITY_FINDINGS_TREND, READINESS_TREND } from "@/lib/mock-data";
import { analyzeProject, saveLatestAnalysis, getRecommendationColor, getRiskColor, formatTimestamp, type NormalizedAnalysis } from "@/lib/api";
import {
  FileQuestion, CodeXml, ShieldAlert, Lock, TestTube2, Building2,
  FileDown, Save, History, Shield, ChevronRight, RefreshCcw, FileJson,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI SDLC Guardian — Prevent Defects Before Production" },
      { name: "description", content: "AI-powered SDLC intelligence: requirement gaps, implementation risks, testing coverage, and release readiness in one dashboard." },
      { property: "og:title", content: "AI SDLC Guardian" },
      { property: "og:description", content: "Prevent defects before they reach production." },
    ],
  }),
  component: Dashboard,
});

function normRiskLevel(v: unknown): RiskLevel | undefined {
  const up = String(v ?? "").toUpperCase();
  return up === "LOW" || up === "MEDIUM" || up === "HIGH" ? up : undefined;
}

function asStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : x && typeof x === "object" ? (x as { title?: string; description?: string }).title ?? (x as { description?: string }).description ?? JSON.stringify(x) : String(x)))
    .filter(Boolean);
}

function Dashboard() {
  const [reqs, setReqs] = useState("");
  const [dev, setDev] = useState("");
  const [tests, setTests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult>(MOCK_RESULT);
  const [normalized, setNormalized] = useState<NormalizedAnalysis | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  async function analyze() {
    // Client-side validation — keep messages user-friendly.
    const r = reqs.trim(), d = dev.trim(), t = tests.trim();
    const MIN = 10;
    if (!r || !d || !t) {
      toast.error("Please complete all fields", { description: "Requirement, Change Summary, and Testing Summary are required." });
      return;
    }
    if (r.length < MIN || d.length < MIN || t.length < MIN) {
      toast.error("Add more detail", { description: `Each field needs at least ${MIN} characters so the AI can analyze meaningfully.` });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const api = await analyzeProject({
        requirement: r,
        changeSummary: d,
        testingSummary: t,
      });
      setNormalized(api);
      saveLatestAnalysis(api);

      const validated: AnalysisResult = {
        ...generateMockFromInputs(reqs, dev, tests),
        analyzedAt: api.timestamp,
        projectName: api.releaseId,
        releaseConfidenceScore: api.releaseConfidenceScore,
        releaseConfidence: api.releaseConfidenceScore,
        releaseRecommendation: (api.releaseRecommendation === "UNKNOWN" ? "NO_GO" : api.releaseRecommendation) as AnalysisResult["releaseRecommendation"],
        riskLevel: api.riskLevel as RiskLevel,
        criticalBlockers: api.criticalBlockers,
        topCriticalRisks: api.criticalBlockers,
        requiredActionsBeforeRelease: api.requiredActions,
        executiveSummary: api.executiveSummary,
        deploymentNotes: "",
        securityScore: api.securityScore,
        securityRiskLevel: api.securityRiskLevel as RiskLevel,
        criticalVulnerabilities: [],
        securityRecommendations: [],
        performanceScore: api.performanceScore,
        performanceRiskLevel: api.performanceRiskLevel as RiskLevel,
        qaCoverageScore: api.releaseMetrics.qaReadiness || null,
        complianceScore: api.complianceScore,
        overallRiskScore: api.overallRiskScore,
        businessScore: api.businessScore,
        businessRiskLevel: api.businessRiskLevel as RiskLevel,
        observabilityScore: api.observabilityScore,
        observabilityRiskLevel: api.observabilityRiskLevel as RiskLevel,
        totalBlockers: api.totalBlockers,
        totalActions: api.totalActions,
      };
      setResult(validated);
      setHasAnalyzed(true);
      toast.success("Analysis completed successfully", { description: `${api.releaseId} · ${api.releaseRecommendation.replace(/_/g, " ")}` });
    } catch (e) {
      if (import.meta.env.DEV) console.error("Analysis error:", e);
      setError("Unable to complete analysis. Please try again.");
      toast.error("Unable to complete analysis", { description: "Please try again in a moment." });
    } finally {
      setLoading(false);
    }
  }


  function handleSave() {
    const saved = saveAssessment(result, { requirement: reqs, dev, tests });
    toast.success("Assessment saved", { description: `Stored locally as ${saved.id}` });
  }
  function handleExport() {
    exportPdf(result);
    toast.success("Opening PDF export…");
  }
  function handleExportJson() {
    exportJson(result, `sdlc-${result.projectName.replace(/\s+/g, "-")}-${Date.now()}.json`);
    toast.success("JSON exported");
  }
  function handleRefresh() {
    if (hasAnalyzed) analyze();
    else toast.message("Run an analysis first to refresh.");
  }

  return (
    <AppShell>
      <div className="space-y-8" id="sdlc-dashboard-root">
        {/* Hero */}
        <header className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-elegant">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-32 -left-16 size-80 rounded-full blur-3xl bg-gradient-to-br from-primary/40 to-chart-4/30" />
            <div className="absolute -bottom-24 -right-12 size-80 rounded-full blur-3xl bg-gradient-to-tr from-info/30 to-success/20" />
          </div>
          <div className="relative flex flex-wrap items-center gap-6 justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Shield className="size-3.5" />
                AI SDLC Guardian
                <ChevronRight className="size-3" />
                <span>{result.projectName}</span>
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
                Prevent Defects Before They <span className="gradient-text">Reach Production</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Multi-agent analysis across requirements, development, testing, and security — release intelligence in seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent transition">
                <RefreshCcw className="size-4" /> Refresh
              </button>
              <button onClick={handleExport} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent transition">
                <FileDown className="size-4" /> Export PDF
              </button>
              <button onClick={handleExportJson} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg glass text-sm hover:bg-accent transition">
                <FileJson className="size-4" /> Export JSON
              </button>
              <button onClick={handleSave} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow hover:scale-[1.02] transition">
                <Save className="size-4" /> Save Assessment
              </button>
            </div>
          </div>
        </header>

        {/* Inputs */}
        <SectionTitle eyebrow="Step 1" title="Project Input" subtitle="Feed our agents your requirements, code changes, and testing artifacts." />
        <InputPanel
          reqs={reqs} setReqs={setReqs}
          dev={dev} setDev={setDev}
          tests={tests} setTests={setTests}
          onAnalyze={analyze} loading={loading}
        />
        {error && (
          <div className="glass rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="font-semibold">Analysis failed. Please verify backend connectivity.</div>
            <div className="text-destructive/80 mt-1 break-words">{error}</div>
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Score Overview */}
            <SectionTitle eyebrow="Score Overview" title="Health Scores" subtitle="Top-line KPIs across the SDLC lifecycle." />
            <ScoreOverview
              items={[
                { title: "Release Confidence", score: result.releaseConfidenceScore, hint: "Composite readiness signal" },
                { title: "Overall Risk", score: result.overallRiskScore ?? null, hint: "Aggregated risk score" },
                { title: "Security Score", score: result.securityScore ?? null, hint: "Vulnerability & exposure" },
                { title: "Performance Score", score: result.performanceScore ?? null, hint: "Latency, throughput, load" },
                { title: "Business Score", score: result.businessScore ?? null, hint: "Business impact posture" },
                { title: "Observability Score", score: result.observabilityScore ?? null, hint: "Logs, metrics, traces" },
                { title: "QA Coverage", score: result.qaCoverageScore ?? result.testCoverageScore, hint: "Test coverage & quality" },
                { title: "Critical Blockers", score: result.totalBlockers ?? (result.criticalBlockers?.length ?? 0), hint: "Items blocking release" },
              ]}
            />

            {normalized && (
              <>
                <SectionTitle eyebrow="Specialist Intelligence" title="Domain Scores & Risk" subtitle="Per-discipline scores with normalized risk levels." />
                <SpecialistIntelligence n={normalized} />

                <SectionTitle eyebrow="Release Metrics" title="Readiness Breakdown" subtitle="Stage-by-stage readiness from the latest analysis." />
                <ReleaseMetricsCard n={normalized} />
              </>
            )}



            {/* Trend Charts */}
            <SectionTitle eyebrow="Trends" title="Lifecycle Trends" subtitle="Risk, release, security, and readiness over the last 8 weeks." />
            <div className="grid lg:grid-cols-2 gap-3">
              <TrendChartCard title="Risk Trend" subtitle="Open risks by week" data={RISK_TREND} variant="line" color="var(--color-warning)" />
              <TrendChartCard title="Release Trend" subtitle="Confidence over time" data={RELEASE_TREND} color="var(--color-primary)" />
              <TrendChartCard title="Security Findings Trend" subtitle="New findings per week" data={SECURITY_FINDINGS_TREND} variant="line" color="var(--color-destructive)" />
              <TrendChartCard title="Deployment Readiness Trend" subtitle="Composite readiness signal" data={READINESS_TREND} color="var(--color-info)" />
            </div>



            {/* Release Decision */}
            <SectionTitle eyebrow="Decision" title="Release Decision Center" subtitle="GO / NO-GO call backed by confidence math." />
            <ReleaseDecision result={result} />

            {/* Executive Summary + Critical Blockers + Required Actions */}
            <SectionTitle eyebrow="Intelligence" title="Release Intelligence" subtitle="Executive view, blockers, and mandatory pre-release actions." />
            <div className="grid lg:grid-cols-2 gap-4">
              <ExecutiveSummaryCard result={result} />
              <CriticalBlockersCard result={result} />
            </div>
            <RequiredActionsCard result={result} />

            {/* Security Intelligence */}
            <SectionTitle eyebrow="Security" title="Security Intelligence" subtitle="Vulnerability posture and remediation guidance." />
            <SecurityIntelligence result={result} />

            {/* Risk Matrix */}
            <SectionTitle eyebrow="Risk Analysis" title="Risk Visualization" subtitle="Color-coded risk posture across SDLC dimensions." />
            <RiskMatrix result={result} />

            {/* Risk Center (only when we have data) */}
            {hasAnalyzed && (
              <>
                <SectionTitle eyebrow="Risk Intelligence" title="Risk Center" subtitle="Detailed findings by category." />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <RiskCard title="Missing Requirements" icon={FileQuestion} items={result.missingRequirements} tone="warning" />
                  <RiskCard title="Missing Implementations" icon={CodeXml} items={result.missingImplementations} tone="danger" />
                  <RiskCard title="Technical Risks" icon={ShieldAlert} items={result.technicalRisks} tone="primary" />
                  <RiskCard title="Security Risks" icon={Lock} items={result.securityRisks} tone="danger" />
                  <RiskCard title="Testing Risks" icon={TestTube2} items={result.testingRisks} tone="warning" />
                  <RiskCard title="Architectural Risks" icon={Building2} items={result.architecturalRisks} tone="info" />
                </div>
              </>
            )}

            {/* AI Insights */}
            <SectionTitle eyebrow="AI Insights" title="Business Intelligence" subtitle="Generated narrative for leadership review." />
            <AiInsights result={result} />

            {/* Charts */}
            <SectionTitle eyebrow="Analytics" title="SDLC Impact Analysis" subtitle="Multi-dimensional readiness visualizations." />
            <SdlcCharts result={result} />

            {/* Stakeholder */}
            <SectionTitle eyebrow="Stakeholders" title="Role-Based View" subtitle="Insights tailored to each stakeholder." />
            <StakeholderView result={result} />

            {/* History */}
            <SectionTitle eyebrow="History" title="Recent Analyses" subtitle="Past assessments and their outcomes." />
            <RecentAnalyses />
          </>
        )}

        <footer className="pt-8 pb-4 text-center text-xs text-muted-foreground">
          AI SDLC Guardian · Built for enterprise software quality governance
        </footer>
      </div>
    </AppShell>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 flex-wrap">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</div>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground max-w-md">{subtitle}</p>}
    </div>
  );
}

function RecentAnalyses() {
  const items = [
    { name: "Payments Platform v4.2", at: "2h ago", rec: "GO_WITH_RISK", conf: 71 },
    { name: "Checkout Service v3.9", at: "Yesterday", rec: "GO", conf: 91 },
    { name: "Refund Engine v2.1", at: "3d ago", rec: "NO_GO", conf: 48 },
    { name: "Notifications v1.7", at: "1w ago", rec: "GO", conf: 87 },
  ];
  const recCls = (r: string) =>
    r === "GO" ? "text-success border-success/30 bg-success/10"
    : r === "NO_GO" ? "text-destructive border-destructive/30 bg-destructive/10"
    : "text-warning border-warning/30 bg-warning/10";
  return (
    <div className="glass rounded-2xl shadow-elegant overflow-hidden">
      <div className="divide-y divide-border">
        {items.map((it) => (
          <div key={it.name} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition">
            <div className="size-10 rounded-xl glass grid place-items-center"><History className="size-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{it.name}</div>
              <div className="text-xs text-muted-foreground">{it.at}</div>
            </div>
            <div className="hidden sm:block w-40">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${it.conf}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 text-right font-mono">{it.conf}% confidence</div>
            </div>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${recCls(it.rec)}`}>
              {it.rec.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecialistIntelligence({ n }: { n: NormalizedAnalysis }) {
  const items = [
    { title: "Security", score: n.securityScore, level: n.securityRiskLevel },
    { title: "Performance", score: n.performanceScore, level: n.performanceRiskLevel },
    { title: "Business", score: n.businessScore, level: n.businessRiskLevel },
    { title: "Observability", score: n.observabilityScore, level: n.observabilityRiskLevel },
    { title: "Reliability", score: n.reliabilityScore, level: n.reliabilityRiskLevel },
    { title: "Compliance", score: n.complianceScore, level: n.complianceRiskLevel },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.title} className="glass rounded-2xl p-4 shadow-elegant">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{it.title}</div>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(it.level)}`}>{it.level}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold">{it.score}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
          <div className="h-1.5 mt-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-primary" style={{ width: `${Math.max(0, Math.min(100, it.score))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReleaseMetricsCard({ n }: { n: NormalizedAnalysis }) {
  const rows: { label: string; key: keyof NormalizedAnalysis["releaseMetrics"] }[] = [
    { label: "Requirements", key: "requirementsReadiness" },
    { label: "Development", key: "developmentReadiness" },
    { label: "QA", key: "qaReadiness" },
    { label: "Security", key: "securityReadiness" },
    { label: "Performance", key: "performanceReadiness" },
    { label: "Business", key: "businessReadiness" },
    { label: "Observability", key: "observabilityReadiness" },
    { label: "Reliability", key: "reliabilityReadiness" },
    { label: "Compliance", key: "complianceReadiness" },
  ];
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">{n.releaseId}</div>
        <div className="text-xs text-muted-foreground">{formatTimestamp(n.timestamp)}</div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((r) => {
          const v = n.releaseMetrics[r.key];
          return (
            <div key={r.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{r.label} Readiness</span>
                <span className="font-mono">{v}%</span>
              </div>
              <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full gradient-primary" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRecommendationColor(n.releaseRecommendation)}`}>{n.releaseRecommendation.replace(/_/g, " ")}</span>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(n.riskLevel)}`}>Risk {n.riskLevel}</span>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">Confidence {n.releaseConfidenceScore}%</span>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">Overall Risk {n.overallRiskScore}</span>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">Blockers {n.totalBlockers}</span>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">Actions {n.totalActions}</span>
      </div>
    </div>
  );
}

