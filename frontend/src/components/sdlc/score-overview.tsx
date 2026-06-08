import { ScoreRing, StatusBadge } from "./badges";

export interface ScoreItem {
  title: string;
  score: number | null | undefined;
  hint?: string;
}

export function ScoreOverview({ items }: { items: ScoreItem[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((it) => {
        const has = typeof it.score === "number" && Number.isFinite(it.score);
        const score = has ? Math.max(0, Math.min(100, it.score as number)) : 0;
        return (
          <div key={it.title} className="glass rounded-2xl p-5 shadow-elegant float-in hover:shadow-glow transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground truncate">{it.title}</div>
                <div className="mt-2">
                  {has ? (
                    <StatusBadge score={score} />
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border border-border bg-muted text-muted-foreground">
                      Pending
                    </span>
                  )}
                </div>
                {it.hint && <div className="mt-3 text-xs text-muted-foreground max-w-[14ch]">{it.hint}</div>}
              </div>
              {has ? (
                <ScoreRing score={score} size={80} />
              ) : (
                <div className="size-[80px] rounded-full border border-dashed border-border grid place-items-center text-[10px] text-muted-foreground">
                  Pending
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
