import type { AnalysisResult } from "@/lib/sdlc-data";
import { Sparkles } from "lucide-react";

export function ExecutiveSummaryCard({ result }: { result: AnalysisResult }) {
  const text = (result.executiveSummary ?? "").trim();
  return (
    <div className="glass rounded-2xl p-6 shadow-elegant relative overflow-hidden">
      <div className="absolute -top-16 -right-16 size-56 rounded-full blur-3xl bg-gradient-to-br from-primary/30 to-chart-4/20 opacity-60 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-9 rounded-lg glass grid place-items-center">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI Generated</div>
            <h3 className="text-base font-semibold">Executive Summary</h3>
          </div>
        </div>
        {text ? (
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">{text}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No executive summary returned by the analysis service.
          </p>
        )}
      </div>
    </div>
  );
}
