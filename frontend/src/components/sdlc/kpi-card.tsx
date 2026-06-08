import { ScoreRing, StatusBadge } from "./badges";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  title: string;
  score: number;
  delta?: number;
  hint?: string;
}

export function KpiCard({ title, score, delta = 0, hint }: Props) {
  const up = delta >= 0;
  return (
    <div className="glass rounded-2xl p-5 shadow-elegant float-in hover:shadow-glow transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
          <div className="mt-2"><StatusBadge score={score} /></div>
          {hint && <div className="mt-3 text-xs text-muted-foreground max-w-[14ch]">{hint}</div>}
        </div>
        <ScoreRing score={score} size={88} />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">vs last analysis</span>
        <span className={`inline-flex items-center gap-1 font-medium ${up ? "text-success" : "text-destructive"}`}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(delta)}%
        </span>
      </div>
    </div>
  );
}
