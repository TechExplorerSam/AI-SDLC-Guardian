// Mock data for pages where backend endpoints don't exist yet.
import type { RiskLevel } from "@/lib/sdlc-data";

export type RiskCategory = "security" | "performance" | "qa" | "compliance" | "architecture";
export type RiskStatus = "open" | "accepted" | "mitigated";

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  level: Exclude<RiskLevel, "UNKNOWN">;
  project: string;
  team: string;
  releaseWindow: string;
  impact: string;
  probability: "Low" | "Medium" | "High";
  recommendation: string;
  owner: string;
  dueDate: string;
  status: RiskStatus;
}

const teams = ["Payments", "Checkout", "Platform", "Identity", "Notifications"];
const projects = ["Payments v4.2", "Checkout v3.9", "Refund Engine v2.1", "Notifications v1.7", "Identity v5.0"];
const windows = ["Q2-W1", "Q2-W2", "Q2-W3", "Q2-W4"];

const seed: Omit<Risk, "id" | "status" | "project" | "team" | "releaseWindow" | "dueDate">[] = [
  { title: "JWT secret rotation policy missing", description: "No automated rotation; manual quarterly only.", category: "security", level: "HIGH", impact: "Token compromise blast radius >90 days", probability: "Medium", recommendation: "Implement 30-day automated rotation via KMS.", owner: "Sec Eng" },
  { title: "PII in debug logs", description: "Cardholder name logged at INFO on failed validation.", category: "compliance", level: "HIGH", impact: "PCI-DSS violation risk", probability: "High", recommendation: "Scrub PII in log pipeline + regression test.", owner: "Platform" },
  { title: "N+1 queries on listing endpoint", description: "Merchant loaded per transaction without batching.", category: "performance", level: "MEDIUM", impact: "p95 latency >800ms under load", probability: "High", recommendation: "Eager load + add index.", owner: "Payments" },
  { title: "Flaky webhook tests", description: "12% flakiness in CI; signal lost.", category: "qa", level: "LOW", impact: "Reduced deploy confidence", probability: "Medium", recommendation: "Isolate flake sources; quarantine then fix.", owner: "QA Guild" },
  { title: "Tight coupling: billing ↔ notifications", description: "Notification failures cascade.", category: "architecture", level: "MEDIUM", impact: "Outage scope expands", probability: "Medium", recommendation: "Outbox + async queue.", owner: "Architecture" },
  { title: "No load tests for refund peak", description: "Refund spikes during settlement untested.", category: "performance", level: "HIGH", impact: "Unverified capacity", probability: "High", recommendation: "k6 scenario at 10x baseline.", owner: "Payments" },
  { title: "Idempotency keys not enforced", description: "/charges accepts duplicates.", category: "security", level: "HIGH", impact: "Financial duplication", probability: "High", recommendation: "Add middleware + tests.", owner: "Payments" },
  { title: "Missing SOC2 evidence for change mgmt", description: "Change approval not auditable.", category: "compliance", level: "MEDIUM", impact: "Audit finding", probability: "Medium", recommendation: "Enable audit log on PR merges.", owner: "Compliance" },
  { title: "Coverage gap on 3DS challenge", description: "Only happy-path covered.", category: "qa", level: "MEDIUM", impact: "Edge bugs reach prod", probability: "Medium", recommendation: "Add failure-path E2E.", owner: "QA Guild" },
  { title: "Shared DB schema across services", description: "Two services mutate `invoices` directly.", category: "architecture", level: "HIGH", impact: "Coupling and migration risk", probability: "High", recommendation: "Schema ownership migration.", owner: "Architecture" },
  { title: "Outdated TLS cipher allowed", description: "TLS_RSA_WITH_AES_128 still enabled.", category: "security", level: "LOW", impact: "Weak transport security", probability: "Low", recommendation: "Disable in load balancer policy.", owner: "Sec Eng" },
  { title: "Slow page TTFB on dashboard", description: "Server query >600ms p95.", category: "performance", level: "LOW", impact: "Degraded UX", probability: "Medium", recommendation: "Cache the aggregation query.", owner: "Platform" },
];

export const MOCK_RISKS: Risk[] = seed.map((r, i) => ({
  ...r,
  id: `R-${1000 + i}`,
  project: projects[i % projects.length],
  team: teams[i % teams.length],
  releaseWindow: windows[i % windows.length],
  status: (["open", "open", "open", "accepted", "mitigated"] as RiskStatus[])[i % 5],
  dueDate: new Date(Date.now() + (3 + (i % 14)) * 86400000).toISOString().slice(0, 10),
}));

export interface ReleaseHistoryEntry {
  id: string;
  projectName: string;
  date: string;
  confidence: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation: "GO" | "GO_WITH_RISK" | "NO_GO";
  status: "Deployed" | "Rolled Back" | "Pending" | "Blocked";
  notes: string;
}

export const MOCK_RELEASES: ReleaseHistoryEntry[] = [
  { id: "REL-2026-104", projectName: "Payments Platform v4.2", date: "2026-06-03", confidence: 71, riskLevel: "MEDIUM", recommendation: "GO_WITH_RISK", status: "Pending", notes: "Feature-flagged refund flow." },
  { id: "REL-2026-103", projectName: "Checkout Service v3.9", date: "2026-06-02", confidence: 91, riskLevel: "LOW", recommendation: "GO", status: "Deployed", notes: "Clean release." },
  { id: "REL-2026-102", projectName: "Refund Engine v2.1", date: "2026-05-30", confidence: 48, riskLevel: "HIGH", recommendation: "NO_GO", status: "Blocked", notes: "Idempotency unresolved." },
  { id: "REL-2026-101", projectName: "Notifications v1.7", date: "2026-05-27", confidence: 87, riskLevel: "LOW", recommendation: "GO", status: "Deployed", notes: "Performance tuned." },
  { id: "REL-2026-100", projectName: "Identity v5.0", date: "2026-05-22", confidence: 64, riskLevel: "MEDIUM", recommendation: "GO_WITH_RISK", status: "Deployed", notes: "OAuth update." },
  { id: "REL-2026-099", projectName: "Platform v8.4", date: "2026-05-15", confidence: 55, riskLevel: "MEDIUM", recommendation: "GO_WITH_RISK", status: "Rolled Back", notes: "Memory regression." },
  { id: "REL-2026-098", projectName: "Payments Platform v4.1", date: "2026-05-08", confidence: 82, riskLevel: "LOW", recommendation: "GO", status: "Deployed", notes: "" },
  { id: "REL-2026-097", projectName: "Checkout Service v3.8", date: "2026-05-01", confidence: 78, riskLevel: "LOW", recommendation: "GO", status: "Deployed", notes: "" },
];

export interface TrendPoint { label: string; value: number; secondary?: number; }

export const RISK_TREND: TrendPoint[] = [
  { label: "W1", value: 18 }, { label: "W2", value: 22 }, { label: "W3", value: 17 },
  { label: "W4", value: 14 }, { label: "W5", value: 11 }, { label: "W6", value: 9 },
  { label: "W7", value: 12 }, { label: "W8", value: 8 },
];

export const RELEASE_TREND: TrendPoint[] = [
  { label: "W1", value: 65, secondary: 2 }, { label: "W2", value: 70, secondary: 3 },
  { label: "W3", value: 74, secondary: 1 }, { label: "W4", value: 72, secondary: 2 },
  { label: "W5", value: 80, secondary: 0 }, { label: "W6", value: 84, secondary: 1 },
  { label: "W7", value: 79, secondary: 1 }, { label: "W8", value: 86, secondary: 0 },
];

export const SECURITY_FINDINGS_TREND: TrendPoint[] = [
  { label: "W1", value: 9 }, { label: "W2", value: 12 }, { label: "W3", value: 8 },
  { label: "W4", value: 6 }, { label: "W5", value: 7 }, { label: "W6", value: 4 },
  { label: "W7", value: 5 }, { label: "W8", value: 3 },
];

export const READINESS_TREND: TrendPoint[] = [
  { label: "W1", value: 60 }, { label: "W2", value: 64 }, { label: "W3", value: 68 },
  { label: "W4", value: 71 }, { label: "W5", value: 75 }, { label: "W6", value: 79 },
  { label: "W7", value: 78 }, { label: "W8", value: 82 },
];

export interface InsightSection {
  key: "requirement" | "development" | "qa" | "security" | "performance" | "compliance";
  title: string;
  score: number;
  summary: string;
  findings: string[];
  recommendations: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export const MOCK_INSIGHTS: InsightSection[] = [
  { key: "requirement", title: "Requirement Intelligence", score: 78, riskLevel: "MEDIUM",
    summary: "BRD covers core flows; ambiguity remains in partial refund and FX rounding rules.",
    findings: ["Partial refund flow undefined", "Webhook retry SLA missing", "Multi-currency rounding not specified"],
    recommendations: ["Add acceptance criteria for partial refunds", "Document webhook DLQ behavior", "Define rounding tolerance"] },
  { key: "development", title: "Development Intelligence", score: 84, riskLevel: "LOW",
    summary: "Implementation tracks PRs to acceptance criteria; minor gaps in audit logging.",
    findings: ["Audit log missing on /refunds", "Idempotency middleware partial"],
    recommendations: ["Wrap all mutating endpoints in idempotency middleware", "Add structured audit events"] },
  { key: "qa", title: "QA Intelligence", score: 62, riskLevel: "HIGH",
    summary: "Test coverage trails feature velocity; flakiness erodes signal.",
    findings: ["12% webhook flake rate", "No load tests for refund peak", "3DS coverage gap"],
    recommendations: ["Stabilize webhook suite", "k6 load scenario at 10x", "Add 3DS failure-path E2E"] },
  { key: "security", title: "Security Intelligence", score: 58, riskLevel: "HIGH",
    summary: "Critical exposures in logging and idempotency must be resolved before production.",
    findings: ["PII written at INFO level", "JWT rotation manual only", "Idempotency not enforced"],
    recommendations: ["Scrub PII in log pipeline", "Automate JWT rotation", "Enforce idempotency-key"] },
  { key: "performance", title: "Performance Intelligence", score: 71, riskLevel: "MEDIUM",
    summary: "Hot paths within SLO; listing endpoint shows N+1 risk under load.",
    findings: ["N+1 in transactions listing", "Synchronous email send in checkout"],
    recommendations: ["Eager load merchant + index", "Move email send to queue worker"] },
  { key: "compliance", title: "Compliance Intelligence", score: 74, riskLevel: "MEDIUM",
    summary: "SOC2/PCI evidence mostly in place; change-management gap detected.",
    findings: ["Change approval not auditable on merges", "PII handling needs DPIA refresh"],
    recommendations: ["Enable PR audit log", "Refresh DPIA for refund flow"] },
];
