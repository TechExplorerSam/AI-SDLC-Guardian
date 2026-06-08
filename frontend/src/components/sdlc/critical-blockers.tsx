import type { AnalysisResult } from "@/lib/sdlc-data";
import { AlertOctagon, CheckCircle2 } from "lucide-react";

export function CriticalBlockersCard({ result }: { result: AnalysisResult }) {
  const blockers = Array.isArray(result.criticalBlockers) && result.criticalBlockers.length
    ? result.criticalBlockers
    : Array.isArray(result.topCriticalRisks) ? result.topCriticalRisks : [];
  const count = blockers.length;
  return (
    <div className="glass rounded-2xl p-6 shadow-elegant relative overflow-hidden">
      <div className="absolute -top-16 -right-16 size-56 rounded-full blur-3xl bg-gradient-to-br from-destructive/30 to-warning/20 opacity-60 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg glass grid place-items-center">
              <AlertOctagon className="size-4 text-destructive" />
            </div>
            <h3 className="text-base font-semibold">Critical Blockers</h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive font-mono">
            {count} {count === 1 ? "blocker" : "blockers"}
          </span>
        </div>
        {count === 0 ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" />
            No critical blockers identified.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {blockers.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="text-destructive mt-1">▸</span>
                <span className="leading-relaxed break-words">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
