import type { AnalysisResult, RiskLevel } from "@/lib/sdlc-data";
import { cn } from "@/lib/utils";

interface Cell {
  label: string;
  level: RiskLevel;
}

const TONE: Record<RiskLevel, string> = {
  LOW: "bg-success/15 border-success/30 text-success",
  MEDIUM: "bg-warning/15 border-warning/30 text-warning",
  HIGH: "bg-destructive/15 border-destructive/30 text-destructive",
  UNKNOWN: "bg-muted border-border text-muted-foreground",
};

function scoreToLevel(score: number | null | undefined): RiskLevel {
  if (typeof score !== "number" || !Number.isFinite(score)) return "UNKNOWN";
  if (score >= 75) return "LOW";
  if (score >= 50) return "MEDIUM";
  return "HIGH";
}

function normLevel(l?: string): RiskLevel {
  const up = String(l ?? "").toUpperCase();
  return (["LOW", "MEDIUM", "HIGH"] as readonly string[]).includes(up) ? (up as RiskLevel) : "UNKNOWN";
}

export function RiskMatrix({ result }: { result: AnalysisResult }) {
  const cells: Cell[] = [
    { label: "Overall Risk", level: normLevel(result.riskLevel) },
    { label: "Security Risk", level: normLevel(result.securityRiskLevel) },
    { label: "Requirement Risk", level: scoreToLevel(result.requirementHealthScore) },
    { label: "Development Risk", level: scoreToLevel(result.developmentCompletenessScore) },
    { label: "Testing Risk", level: scoreToLevel(result.testCoverageScore) },
    { label: "Release Risk", level: scoreToLevel(result.releaseConfidenceScore) },
  ];

  return (
    <div className="glass rounded-2xl p-6 shadow-elegant">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Risk Matrix</div>
          <h3 className="text-base font-semibold">Multi-Dimensional Risk Posture</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
          {(["LOW", "MEDIUM", "HIGH"] as const).map((l) => (
            <span key={l} className={cn("px-2 py-0.5 rounded-full border", TONE[l])}>{l}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cells.map((c) => (
          <div key={c.label} className={cn("rounded-xl border p-4 transition", TONE[c.level])}>
            <div className="text-[10px] uppercase tracking-wider opacity-80">{c.label}</div>
            <div className="mt-1.5 text-lg font-bold tracking-tight">
              {c.level === "UNKNOWN" ? "N/A" : c.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
