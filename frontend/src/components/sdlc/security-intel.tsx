import type { AnalysisResult } from "@/lib/sdlc-data";
import { ScoreRing } from "./badges";
import { RiskLevelBadge } from "./risk-level-badge";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

export function SecurityIntelligence({ result }: { result: AnalysisResult }) {
  const hasScore = typeof result.securityScore === "number" && Number.isFinite(result.securityScore);
  const score = hasScore ? Math.max(0, Math.min(100, result.securityScore as number)) : null;
  const vulns = Array.isArray(result.criticalVulnerabilities) ? result.criticalVulnerabilities : [];
  const recs = Array.isArray(result.securityRecommendations) ? result.securityRecommendations : [];

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-elegant">
      <div className="absolute -top-32 -right-24 size-80 rounded-full blur-3xl bg-gradient-to-br from-destructive/20 to-primary/20 opacity-60 pointer-events-none" />
      <div className="relative grid lg:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="flex flex-col items-center gap-3 min-w-[160px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Security</div>
          </div>
          {score !== null ? (
            <ScoreRing score={score} size={120} label="SEC SCORE" />
          ) : (
            <div className="size-[120px] rounded-full border border-dashed border-border grid place-items-center text-xs text-muted-foreground">
              Pending
            </div>
          )}
          <RiskLevelBadge level={result.securityRiskLevel} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 w-full">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="size-4 text-destructive" />
              <h4 className="text-sm font-semibold">Critical Vulnerabilities</h4>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">{vulns.length}</span>
            </div>
            {vulns.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {hasScore ? "No critical vulnerabilities detected." : "Awaiting security scan data."}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {vulns.map((v, i) => (
                  <li key={i} className="text-sm flex gap-2 break-words">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-warning" />
              <h4 className="text-sm font-semibold">Security Recommendations</h4>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">{recs.length}</span>
            </div>
            {recs.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {hasScore ? "No additional recommendations." : "Awaiting security recommendations."}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {recs.map((r, i) => (
                  <li key={i} className="text-sm flex gap-2 break-words">
                    <span className="text-warning mt-0.5">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
