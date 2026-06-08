import type { AnalysisResult } from "@/lib/sdlc-data";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Rocket } from "lucide-react";
import { RiskLevelBadge } from "./risk-level-badge";

interface Props { result: AnalysisResult }

const META = {
  GO: {
    label: "GO",
    sub: "Cleared for production deployment",
    icon: CheckCircle2,
    ring: "from-success to-info",
    glow: "shadow-[0_0_60px_-10px_oklch(0.72_0.17_155/0.6)]",
    text: "text-success",
  },
  GO_WITH_RISK: {
    label: "GO WITH RISK",
    sub: "Conditional release — mitigate before deploy",
    icon: AlertTriangle,
    ring: "from-warning to-chart-4",
    glow: "shadow-[0_0_60px_-10px_oklch(0.80_0.16_80/0.55)]",
    text: "text-warning",
  },
  NO_GO: {
    label: "NO GO",
    sub: "Block release — critical risks unresolved",
    icon: XCircle,
    ring: "from-destructive to-chart-4",
    glow: "shadow-[0_0_60px_-10px_oklch(0.65_0.22_25/0.6)]",
    text: "text-destructive",
  },
} as const;

export function ReleaseDecision({ result }: Props) {
  const recKey = String(result.releaseRecommendation ?? "").toUpperCase().replace(/[\s-]/g, "_");
  const rec = (recKey in META ? recKey : "NO_GO") as keyof typeof META;
  const meta = META[rec];
  const Icon = meta.icon;
  const confidence = Number.isFinite(result.releaseConfidence) ? result.releaseConfidence : 0;
  const actions = Array.isArray(result.requiredActionsBeforeRelease) ? result.requiredActionsBeforeRelease : [];

  return (
    <div className={cn("glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden", meta.glow)}>
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className={cn("absolute -top-32 -right-32 size-96 rounded-full blur-3xl bg-gradient-to-br", meta.ring)} />
      </div>

      <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className={cn("size-20 rounded-2xl grid place-items-center bg-gradient-to-br", meta.ring)}>
            <Icon className="size-10 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Release Decision</div>
            <div className={cn("text-3xl md:text-4xl font-bold tracking-tight", meta.text)}>{meta.label}</div>
            <div className="text-sm text-muted-foreground mt-1">{meta.sub}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider text-muted-foreground">Confidence</span>
            <span className="font-mono font-semibold">{confidence}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden border border-border">
            <div
              className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-700", meta.ring)}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
            <RiskLevelBadge level={result.riskLevel ?? (rec === "GO" ? "LOW" : rec === "GO_WITH_RISK" ? "MEDIUM" : "HIGH")} />
            <span className="text-muted-foreground">Window: 48h</span>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition">
          <Rocket className="size-4" />
          Deployment Plan
        </button>
      </div>

      <div className="relative mt-6 grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Deployment Recommendation</div>
          <p className="text-sm leading-relaxed">{result.deploymentNotes || "No deployment notes provided."}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Required Actions Before Release</div>
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No required actions.</p>
          ) : (
            <ul className="space-y-1.5">
              {actions.map((a, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
