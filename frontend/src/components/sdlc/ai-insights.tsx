import type { AnalysisResult } from "@/lib/sdlc-data";
import { Sparkles, AlertOctagon, ListChecks, Megaphone } from "lucide-react";

export function AiInsights({ result }: { result: AnalysisResult }) {
  const criticalRisks = Array.isArray(result.topCriticalRisks) ? result.topCriticalRisks : [];
  const actions = Array.isArray(result.recommendedActions) ? result.recommendedActions : [];
  const rec = String(result.releaseRecommendation ?? "").toUpperCase();
  const recLine =
    rec === "GO" ? "Recommended: Proceed with full deployment."
    : rec === "GO_WITH_RISK" ? "Recommended: Conditional release behind feature flag."
    : rec === "NO_GO" ? "Recommended: Hold release until critical items are mitigated."
    : "Recommendation unavailable.";

  const cards = [
    {
      title: "Executive Summary",
      icon: Sparkles,
      tone: "from-primary/30 to-chart-4/20",
      body: <p className="text-sm leading-relaxed text-foreground/90">{result.executiveSummary || "No executive summary available."}</p>,
    },
    {
      title: "Top Critical Risks",
      icon: AlertOctagon,
      tone: "from-destructive/30 to-warning/20",
      body: criticalRisks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No critical blockers found.</p>
      ) : (
        <ul className="space-y-2">
          {criticalRisks.map((r, i) => (
            <li key={i} className="text-sm flex gap-2"><span className="text-destructive">▸</span>{r}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Recommended Actions",
      icon: ListChecks,
      tone: "from-info/30 to-primary/20",
      body: actions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No required actions.</p>
      ) : (
        <ol className="space-y-2">
          {actions.map((r, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-info font-mono w-4 shrink-0">{i + 1}.</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      ),
    },
    {
      title: "Release Recommendation",
      icon: Megaphone,
      tone: "from-success/30 to-info/20",
      body: (
        <div className="space-y-2">
          <div className="text-sm font-medium">{recLine}</div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.deploymentNotes || "No deployment notes provided."}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {cards.map(({ title, icon: Icon, tone, body }) => (
        <div key={title} className="relative glass rounded-2xl p-5 shadow-elegant overflow-hidden float-in">
          <div className={`absolute -top-16 -right-16 size-48 rounded-full blur-3xl bg-gradient-to-br ${tone} opacity-60 pointer-events-none`} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-lg glass grid place-items-center"><Icon className="size-4 text-primary" /></div>
              <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            {body}
          </div>
        </div>
      ))}
    </div>
  );
}
