// Centralized API service for the AI SDLC Guardian backend (n8n).
// All upstream calls are proxied through TanStack Start server functions
// (see src/lib/n8n.functions.ts) so the bearer token never reaches the browser.
import {
  analyzeProjectFn,
  releaseHistoryFn,
  aiInsightsFn,
  reportsFn,
  riskCenterFn,
  healthFn,
  releaseDetailsFn,
} from "@/lib/n8n.functions";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
export type Recommendation = "GO" | "GO_WITH_RISK" | "NO_GO" | "UNKNOWN";

export interface ReleaseMetrics {
  requirementsReadiness: number;
  developmentReadiness: number;
  qaReadiness: number;
  securityReadiness: number;
  performanceReadiness: number;
  businessReadiness: number;
  observabilityReadiness: number;
  reliabilityReadiness: number;
  complianceReadiness: number;
}

export interface NormalizedAnalysis {
  releaseId: string;
  timestamp: string;
  overallRiskScore: number;
  releaseConfidenceScore: number;
  riskLevel: RiskLevel;
  releaseRecommendation: Recommendation;

  securityScore: number;
  performanceScore: number;
  businessScore: number;
  observabilityScore: number;
  reliabilityScore: number;
  complianceScore: number;

  securityRiskLevel: RiskLevel;
  performanceRiskLevel: RiskLevel;
  businessRiskLevel: RiskLevel;
  observabilityRiskLevel: RiskLevel;
  reliabilityRiskLevel: RiskLevel;
  complianceRiskLevel: RiskLevel;

  totalBlockers: number;
  totalActions: number;
  criticalBlockers: string[];
  requiredActions: string[];
  executiveSummary: string;

  releaseMetrics: ReleaseMetrics;

  raw?: unknown;
}

export interface NormalizedHistory {
  releases: NormalizedAnalysis[];
  total: number;
}

// ---------- helpers ----------
export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function getRiskColor(level: string | undefined): string {
  switch (String(level ?? "").toUpperCase()) {
    case "LOW": return "text-success border-success/40 bg-success/15";
    case "MEDIUM": return "text-warning border-warning/40 bg-warning/15";
    case "HIGH": return "text-destructive border-destructive/40 bg-destructive/15";
    default: return "text-muted-foreground border-border bg-muted";
  }
}

export function getRecommendationColor(rec: string | undefined): string {
  switch (String(rec ?? "").toUpperCase()) {
    case "GO": return "text-success border-success/40 bg-success/15";
    case "GO_WITH_RISK": return "text-warning border-warning/40 bg-warning/15";
    case "NO_GO": return "text-destructive border-destructive/40 bg-destructive/15";
    default: return "text-muted-foreground border-border bg-muted";
  }
}

export function formatTimestamp(ts: string | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString();
}

export function normalizeRiskLevel(v: unknown): RiskLevel {
  const up = String(v ?? "").toUpperCase().trim();
  if (up === "LOW") return "LOW";
  if (up === "MEDIUM" || up === "MODERATE" || up === "MED") return "MEDIUM";
  if (up === "HIGH" || up === "CRITICAL") return "HIGH";
  return "UNKNOWN";
}

export function normalizeRecommendation(v: unknown): Recommendation {
  const up = String(v ?? "").toUpperCase().replace(/[\s-]/g, "_").trim();
  if (up === "GO") return "GO";
  if (up === "GO_WITH_RISK" || up === "GO_WITHRISK") return "GO_WITH_RISK";
  if (up === "NO_GO" || up === "NOGO" || up === "BLOCK") return "NO_GO";
  return "UNKNOWN";
}

function asStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (x == null) return "";
      if (typeof x === "string") return x;
      if (typeof x === "object") {
        const o = x as Record<string, unknown>;
        return String(o.title ?? o.description ?? o.message ?? JSON.stringify(o));
      }
      return String(x);
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeReleaseMetrics(v: unknown): ReleaseMetrics {
  const m = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    requirementsReadiness: num(m.requirementsReadiness),
    developmentReadiness: num(m.developmentReadiness),
    qaReadiness: num(m.qaReadiness),
    securityReadiness: num(m.securityReadiness),
    performanceReadiness: num(m.performanceReadiness),
    businessReadiness: num(m.businessReadiness),
    observabilityReadiness: num(m.observabilityReadiness),
    reliabilityReadiness: num(m.reliabilityReadiness),
    complianceReadiness: num(m.complianceReadiness),
  };
}

export function normalizeAnalysisResponse(raw: unknown): NormalizedAnalysis {
  const r0: unknown = Array.isArray(raw) ? (raw as unknown[])[0] : raw;
  const r = (r0 && typeof r0 === "object" ? r0 : {}) as Record<string, unknown>;
  const blockers = asStringList(r.criticalBlockers);
  const actions = asStringList(r.requiredActions ?? r.requiredActionsBeforeRelease);
  return {
    releaseId: String(r.releaseId ?? r.id ?? `REL-${Date.now()}`),
    timestamp: String(r.timestamp ?? new Date().toISOString()),
    overallRiskScore: num(r.overallRiskScore),
    releaseConfidenceScore: num(r.releaseConfidenceScore),
    riskLevel: normalizeRiskLevel(r.riskLevel),
    releaseRecommendation: normalizeRecommendation(r.releaseRecommendation),

    securityScore: num(r.securityScore),
    performanceScore: num(r.performanceScore),
    businessScore: num(r.businessScore),
    observabilityScore: num(r.observabilityScore),
    reliabilityScore: num(r.reliabilityScore),
    complianceScore: num(r.complianceScore),

    securityRiskLevel: normalizeRiskLevel(r.securityRiskLevel),
    performanceRiskLevel: normalizeRiskLevel(r.performanceRiskLevel),
    businessRiskLevel: normalizeRiskLevel(r.businessRiskLevel),
    observabilityRiskLevel: normalizeRiskLevel(r.observabilityRiskLevel),
    reliabilityRiskLevel: normalizeRiskLevel(r.reliabilityRiskLevel),
    complianceRiskLevel: normalizeRiskLevel(r.complianceRiskLevel),

    totalBlockers: Number.isFinite(Number(r.totalBlockers)) ? Number(r.totalBlockers) : blockers.length,
    totalActions: Number.isFinite(Number(r.totalActions)) ? Number(r.totalActions) : actions.length,
    criticalBlockers: blockers,
    requiredActions: actions,
    executiveSummary: String(r.executiveSummary ?? ""),

    releaseMetrics: normalizeReleaseMetrics(r.releaseMetrics),

    raw: r0,
  };
}

export function normalizeHistoryResponse(raw: unknown): NormalizedHistory {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.releases)) list = obj.releases as unknown[];
    else if (Array.isArray(obj.data)) list = obj.data as unknown[];
    else if (Array.isArray(obj.items)) list = obj.items as unknown[];
  }
  const releases = list.map((it) => normalizeAnalysisResponse(it));
  // Sort newest-first
  releases.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return { releases, total: releases.length };
}

// ---------- requests (proxied through server functions) ----------

export interface AnalyzePayload {
  requirement: string;
  changeSummary: string;
  testingSummary: string;
}

export async function analyzeProject(payload: AnalyzePayload): Promise<NormalizedAnalysis> {
  const raw = await analyzeProjectFn({ data: payload });
  if (import.meta.env.DEV) console.log("Raw analyze response:", raw);
  const normalized = normalizeAnalysisResponse(raw);
  if (import.meta.env.DEV) console.log("Normalized analyze:", normalized);
  return normalized;
}

export async function getReleaseHistory(): Promise<NormalizedHistory> {
  const raw = await releaseHistoryFn();
  if (import.meta.env.DEV) console.log("Raw history response:", raw);
  const normalized = normalizeHistoryResponse(raw);
  if (import.meta.env.DEV) console.log("Normalized history:", normalized);
  return normalized;
}


// ---------- AI Insights ----------
export interface NormalizedInsights {
  total: number;
  averageConfidence: number;
  averageSecurityScore: number;
  averagePerformanceScore: number;
  averageBusinessScore: number;
  averageObservabilityScore: number;
  averageReliabilityScore: number;
  averageComplianceScore: number;
  noGoCount: number;
  goWithRiskCount: number;
  goCount: number;
  highestRiskArea: string;
  mostCommonBlocker: string;
  raw?: unknown;
}

export function normalizeInsightsResponse(raw: unknown): NormalizedInsights {
  const r0: unknown = Array.isArray(raw) ? (raw as unknown[])[0] : raw;
  const r = (r0 && typeof r0 === "object" ? r0 : {}) as Record<string, unknown>;
  return {
    total: num(r.total),
    averageConfidence: num(r.averageConfidence),
    averageSecurityScore: num(r.averageSecurityScore),
    averagePerformanceScore: num(r.averagePerformanceScore),
    averageBusinessScore: num(r.averageBusinessScore),
    averageObservabilityScore: num(r.averageObservabilityScore),
    averageReliabilityScore: num(r.averageReliabilityScore),
    averageComplianceScore: num(r.averageComplianceScore),
    noGoCount: num(r.noGoCount),
    goWithRiskCount: num(r.goWithRiskCount),
    goCount: num(r.goCount),
    highestRiskArea: String(r.highestRiskArea ?? ""),
    mostCommonBlocker: String(r.mostCommonBlocker ?? ""),
    raw: r0,
  };
}

export async function getAIInsights(): Promise<NormalizedInsights> {
  const raw = await aiInsightsFn();
  return normalizeInsightsResponse(raw);
}


// ---------- Risk Center ----------
export interface RiskCenterSummary {
  totalReleases: number;
  totalRisks: number;
  highRiskReleases: number;
  mediumRiskReleases: number;
  lowRiskReleases: number;
  noGoReleases: number;
  goWithRiskReleases: number;
  goReleases: number;
}
export interface NormalizedRiskCenter {
  generatedAt: string;
  summary: RiskCenterSummary;
  domainRiskBreakdown: Record<string, { LOW?: number; MEDIUM?: number; HIGH?: number; UNKNOWN?: number; averageScore?: number }>;
  topBlockers: { item: string; count: number }[];
  topRequiredActions: { item: string; count: number }[];
  recentHighRiskReleases: NormalizedAnalysis[];
  criticalRiskItems: { releaseId?: string; title?: string; level?: string; domain?: string; description?: string }[];
  riskHeatmap: { domain: string; level: string; count: number }[];
  raw?: unknown;
}

function asCountList(v: unknown): { item: string; count: number }[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => {
    if (typeof x === "string") return { item: x, count: 1 };
    if (x && typeof x === "object") {
      const o = x as Record<string, unknown>;
      return {
        item: String(o.item ?? o.title ?? o.name ?? o.description ?? o.blocker ?? o.action ?? JSON.stringify(o)),
        count: num(o.count ?? o.occurrences ?? 1, 1),
      };
    }
    return { item: String(x), count: 1 };
  }).filter((x) => x.item);
}

export function normalizeRiskCenter(raw: unknown): NormalizedRiskCenter {
  const r0 = Array.isArray(raw) ? raw[0] : raw;
  const r = (r0 && typeof r0 === "object" ? r0 : {}) as Record<string, unknown>;
  const sum = (r.summary && typeof r.summary === "object" ? r.summary : {}) as Record<string, unknown>;
  const recent = Array.isArray(r.recentHighRiskReleases) ? r.recentHighRiskReleases : [];
  return {
    generatedAt: String(r.generatedAt ?? new Date().toISOString()),
    summary: {
      totalReleases: num(sum.totalReleases),
      totalRisks: num(sum.totalRisks),
      highRiskReleases: num(sum.highRiskReleases),
      mediumRiskReleases: num(sum.mediumRiskReleases),
      lowRiskReleases: num(sum.lowRiskReleases),
      noGoReleases: num(sum.noGoReleases),
      goWithRiskReleases: num(sum.goWithRiskReleases),
      goReleases: num(sum.goReleases),
    },
    domainRiskBreakdown: (r.domainRiskBreakdown && typeof r.domainRiskBreakdown === "object" ? r.domainRiskBreakdown : {}) as NormalizedRiskCenter["domainRiskBreakdown"],
    topBlockers: asCountList(r.topBlockers),
    topRequiredActions: asCountList(r.topRequiredActions),
    recentHighRiskReleases: recent.map((it) => normalizeAnalysisResponse(it)),
    criticalRiskItems: Array.isArray(r.criticalRiskItems) ? r.criticalRiskItems.map((x) => {
      const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      return {
        releaseId: o.releaseId ? String(o.releaseId) : undefined,
        title: o.title ? String(o.title) : undefined,
        level: o.level ? String(o.level) : undefined,
        domain: o.domain ? String(o.domain) : undefined,
        description: o.description ? String(o.description) : undefined,
      };
    }) : [],
    riskHeatmap: Array.isArray(r.riskHeatmap) ? r.riskHeatmap.map((x) => {
      const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      return { domain: String(o.domain ?? ""), level: String(o.level ?? "UNKNOWN"), count: num(o.count) };
    }) : [],
    raw: r0,
  };
}

export async function getRiskCenter(): Promise<NormalizedRiskCenter> {
  const raw = await riskCenterFn();
  return normalizeRiskCenter(raw);
}

// ---------- Reports ----------
export interface NormalizedReports {
  generatedAt: string;
  summary: Record<string, unknown>;
  domainScores: Record<string, number>;
  latestRelease: NormalizedAnalysis | null;
  topBlockers: { item: string; count: number }[];
  topRequiredActions: { item: string; count: number }[];
  executiveReport: Record<string, unknown>;
  reports: Record<string, unknown>;
  raw?: unknown;
}

export function normalizeReports(raw: unknown): NormalizedReports {
  const r0 = Array.isArray(raw) ? raw[0] : raw;
  const r = (r0 && typeof r0 === "object" ? r0 : {}) as Record<string, unknown>;
  const ds = (r.domainScores && typeof r.domainScores === "object" ? r.domainScores : {}) as Record<string, unknown>;
  const domainScores: Record<string, number> = {};
  for (const k of Object.keys(ds)) domainScores[k] = num(ds[k]);
  const latest = r.latestRelease ? normalizeAnalysisResponse(r.latestRelease) : null;
  return {
    generatedAt: String(r.generatedAt ?? new Date().toISOString()),
    summary: (r.summary && typeof r.summary === "object" ? r.summary : {}) as Record<string, unknown>,
    domainScores,
    latestRelease: latest,
    topBlockers: asCountList(r.topBlockers),
    topRequiredActions: asCountList(r.topRequiredActions),
    executiveReport: (r.executiveReport && typeof r.executiveReport === "object" ? r.executiveReport : {}) as Record<string, unknown>,
    reports: (r.reports && typeof r.reports === "object" ? r.reports : {}) as Record<string, unknown>,
    raw: r0,
  };
}

export async function getReports(): Promise<NormalizedReports> {
  const raw = await reportsFn();
  return normalizeReports(raw);
}

// ---------- Health ----------
export interface NormalizedHealth {
  status: "OK" | "DEGRADED" | "DOWN" | "UNKNOWN";
  message: string;
  timestamp: string;
  raw?: unknown;
}
export async function getHealth(): Promise<NormalizedHealth> {
  try {
    const raw = await healthFn();
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const statusStr = String(r.status ?? "OK").toUpperCase();
    const status: NormalizedHealth["status"] =
      statusStr === "OK" || statusStr === "HEALTHY" ? "OK" :
      statusStr === "DEGRADED" ? "DEGRADED" :
      statusStr === "DOWN" ? "DOWN" : "OK";
    return {
      status,
      message: String(r.message ?? "Healthy"),
      timestamp: String(r.timestamp ?? new Date().toISOString()),
      raw,
    };
  } catch (e) {
    return { status: "DOWN", message: e instanceof Error ? e.message : "Unreachable", timestamp: new Date().toISOString() };
  }
}

// ---------- Release Details ----------
export async function getReleaseDetails(releaseId: string): Promise<NormalizedAnalysis> {
  const raw = await releaseDetailsFn({ data: { releaseId } });
  return normalizeAnalysisResponse(raw);
}


// ---------- latest result store (cross-page) ----------
const LATEST_KEY = "sdlc:latest-analysis";

export function saveLatestAnalysis(a: NormalizedAnalysis) {
  try { localStorage.setItem(LATEST_KEY, JSON.stringify(a)); } catch { /* noop */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("sdlc:latest", { detail: a }));
}
export function loadLatestAnalysis(): NormalizedAnalysis | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LATEST_KEY);
    return raw ? (JSON.parse(raw) as NormalizedAnalysis) : null;
  } catch { return null; }
}
