import type { AnalysisResult } from "@/lib/sdlc-data";
import { ListChecks, CheckCircle2, Square } from "lucide-react";

export function RequiredActionsCard({ result }: { result: AnalysisResult }) {
  const actions = Array.isArray(result.requiredActionsBeforeRelease)
    ? result.requiredActionsBeforeRelease
    : [];
  return (
    <div className="glass rounded-2xl p-6 shadow-elegant relative overflow-hidden">
      <div className="absolute -top-16 -right-16 size-56 rounded-full blur-3xl bg-gradient-to-br from-info/30 to-primary/20 opacity-60 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg glass grid place-items-center">
              <ListChecks className="size-4 text-info" />
            </div>
            <h3 className="text-base font-semibold">Required Actions Before Release</h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-info/30 bg-info/10 text-info font-mono">
            {actions.length} {actions.length === 1 ? "action" : "actions"}
          </span>
        </div>
        {actions.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" />
            No mandatory actions identified.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {actions.map((a, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <Square className="size-4 mt-0.5 shrink-0 text-info" />
                <span className="leading-relaxed break-words">{a}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
