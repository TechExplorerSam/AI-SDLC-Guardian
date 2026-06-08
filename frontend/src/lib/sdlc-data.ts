export type Severity = "critical" | "high" | "medium" | "low";

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  owner?: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export interface AnalysisResult {
  projectName: string;
  analyzedAt: string;
  requirementHealthScore: number;
  developmentCompletenessScore: number;
  testCoverageScore: number;
  releaseConfidenceScore: number;
  missingRequirements: RiskItem[];
  missingImplementations: RiskItem[];
  technicalRisks: RiskItem[];
  securityRisks: RiskItem[];
  testingRisks: RiskItem[];
  architecturalRisks: RiskItem[];
  executiveSummary: string;
  topCriticalRisks: string[];
  recommendedActions: string[];
  releaseRecommendation: "GO" | "GO_WITH_RISK" | "NO_GO";
  releaseConfidence: number;
  deploymentNotes: string;
  requiredActionsBeforeRelease: string[];
  riskLevel?: RiskLevel;
  criticalBlockers?: string[];
  // Security intelligence (optional, from future backend fields)
  securityScore?: number | null;
  securityRiskLevel?: RiskLevel;
  criticalVulnerabilities?: string[];
  securityRecommendations?: string[];
  performanceScore?: number | null;
  performanceRiskLevel?: RiskLevel;
  qaCoverageScore?: number | null;
  complianceScore?: number | null;
  overallRiskScore?: number | null;
  businessScore?: number | null;
  businessRiskLevel?: RiskLevel;
  observabilityScore?: number | null;
  observabilityRiskLevel?: RiskLevel;
  totalBlockers?: number;
  totalActions?: number;
  stakeholderInsights: {
    developer: string[];
    tester: string[];
    architect: string[];
    productManager: string[];
    releaseManager: string[];
  };
}

const mk = (id: string, title: string, description: string, severity: Severity): RiskItem => ({
  id, title, description, severity,
});

export const MOCK_RESULT: AnalysisResult = {
  projectName: "Payments Platform v4.2",
  analyzedAt: new Date().toISOString(),
  requirementHealthScore: 78,
  developmentCompletenessScore: 84,
  testCoverageScore: 62,
  releaseConfidenceScore: 71,
  missingRequirements: [
    mk("r1", "Refund partial flow undefined", "BRD does not specify behavior for partial refunds on split-tender transactions.", "high"),
    mk("r2", "SLA for webhook retries not documented", "No requirement for retry cadence or dead-letter handling.", "medium"),
    mk("r3", "Multi-currency rounding rules missing", "Acceptance criteria do not cover FX rounding tolerance.", "medium"),
  ],
  missingImplementations: [
    mk("i1", "Idempotency keys not enforced", "POST /charges accepts duplicates without idempotency-key validation.", "critical"),
    mk("i2", "Audit log for refund actions", "Refund endpoint missing structured audit logging.", "high"),
  ],
  technicalRisks: [
    mk("t1", "N+1 queries in transaction listing", "Listing endpoint loads merchant per transaction; risk under load.", "high"),
    mk("t2", "Synchronous email send in checkout", "Blocks request path; should move to queue.", "medium"),
  ],
  securityRisks: [
    mk("s1", "PII in debug logs", "Card holder name logged at INFO level on failed validation.", "critical"),
    mk("s2", "JWT secret rotation policy missing", "No documented rotation interval.", "high"),
    mk("s3", "Rate limiting absent on /auth/reset", "Vulnerable to enumeration.", "high"),
  ],
  testingRisks: [
    mk("te1", "No load tests for refund peak", "Refund spikes during settlement window untested.", "high"),
    mk("te2", "E2E coverage gap on 3DS challenge", "Only happy path tested.", "medium"),
    mk("te3", "Flaky webhook tests", "12% flakiness in CI over last 30 days.", "low"),
  ],
  architecturalRisks: [
    mk("a1", "Tight coupling between billing and notifications", "Notification failures cascade into billing transactions.", "high"),
    mk("a2", "Shared DB schema across services", "Two services mutate `invoices` table directly.", "medium"),
  ],
  executiveSummary:
    "The release introduces meaningful improvements to checkout reliability and refund UX. However, three critical gaps — idempotency enforcement, PII leakage in logs, and missing load tests for refund peaks — present production risk. Resolving the critical items unblocks a confident go-live within 48 hours.",
  topCriticalRisks: [
    "Idempotency keys are not enforced on /charges (financial duplication risk).",
    "Card holder PII is being written to INFO-level logs (compliance risk).",
    "Refund peak-window load behavior is unverified.",
  ],
  recommendedActions: [
    "Enforce idempotency-key validation on all mutating payment endpoints.",
    "Scrub PII from log pipeline and add a regression test.",
    "Add k6 load tests for refund peak (10x baseline) before release.",
    "Document JWT secret rotation policy (90-day).",
    "Move checkout email send to async worker.",
  ],
  releaseRecommendation: "GO_WITH_RISK",
  releaseConfidence: 71,
  deploymentNotes:
    "Conditional go-live. Ship behind a feature flag for refund flow. Critical security and idempotency items must be resolved within the 48-hour pre-deploy window.",
  requiredActionsBeforeRelease: [
    "Patch idempotency enforcement and deploy hotfix.",
    "Remove PII from log sinks; verify in staging.",
    "Run k6 load profile for refund peak.",
  ],
  stakeholderInsights: {
    developer: [
      "Add idempotency-key middleware to /charges, /refunds, /payouts.",
      "Replace synchronous email send with queue worker (BullMQ).",
      "Fix N+1 in TransactionListService via eager-load.",
    ],
    tester: [
      "Add E2E coverage for 3DS challenge + failure paths.",
      "Stabilize webhook test suite; isolate flake sources.",
      "Author k6 scenarios for refund peak window.",
    ],
    architect: [
      "Decouple notifications from billing via outbox pattern.",
      "Plan migration to per-service schema ownership for invoices.",
    ],
    productManager: [
      "Clarify partial-refund acceptance criteria with finance.",
      "Define webhook retry SLA in PRD.",
      "Communicate phased rollout plan to stakeholders.",
    ],
    releaseManager: [
      "Gate release on critical items; use feature flag for refund flow.",
      "Schedule deploy outside settlement window.",
      "Prepare rollback runbook for refund service.",
    ],
  },
};

export function generateMockFromInputs(
  reqs: string, dev: string, tests: string
): AnalysisResult {
  // Deterministic-ish variation so re-runs feel different
  const seed = (reqs.length + dev.length * 2 + tests.length * 3) || 1;
  const flex = (base: number) => Math.max(35, Math.min(98, base + ((seed % 11) - 5)));
  const reqScore = flex(reqs.length > 0 ? 78 : 55);
  const devScore = flex(dev.length > 0 ? 84 : 60);
  const testScore = flex(tests.length > 0 ? 62 : 40);
  const confidence = Math.round((reqScore + devScore + testScore) / 3);
  const rec: AnalysisResult["releaseRecommendation"] =
    confidence >= 85 ? "GO" : confidence >= 65 ? "GO_WITH_RISK" : "NO_GO";
  return {
    ...MOCK_RESULT,
    analyzedAt: new Date().toISOString(),
    requirementHealthScore: reqScore,
    developmentCompletenessScore: devScore,
    testCoverageScore: testScore,
    releaseConfidenceScore: confidence,
    releaseConfidence: confidence,
    releaseRecommendation: rec,
  };
}
