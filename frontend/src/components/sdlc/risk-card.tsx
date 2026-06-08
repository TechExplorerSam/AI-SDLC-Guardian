import { useState } from "react";
import type { RiskItem, Severity } from "@/lib/sdlc-data";
import { SeverityBadge } from "./badges";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: RiskItem[];
  tone?: "danger" | "warning" | "primary" | "info";
}

const FILTERS: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

export function RiskCard({ title, icon: Icon, items, tone = "primary" }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Severity | "all">("all");

  const filtered = filter === "all" ? items : items.filter((i) => i.severity === filter);
  const counts = {
    critical: items.filter((i) => i.severity === "critical").length,
    high: items.filter((i) => i.severity === "high").length,
  };

  const toneClass = {
    danger: "text-destructive bg-destructive/10 border-destructive/30",
    warning: "text-warning bg-warning/10 border-warning/30",
    primary: "text-primary bg-primary/10 border-primary/30",
    info: "text-info bg-info/10 border-info/30",
  }[tone];

  return (
    <div className="glass rounded-2xl shadow-elegant overflow-hidden float-in">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/30 transition"
      >
        <div className={cn("size-10 rounded-xl grid place-items-center border", toneClass)}>
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{title}</span>
            <span className="text-xs text-muted-foreground">{items.length} items</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {counts.critical > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-destructive">
                <AlertTriangle className="size-3" />{counts.critical} critical
              </span>
            )}
            {counts.high > 0 && (
              <span className="text-[10px] uppercase tracking-wider text-warning">{counts.high} high</span>
            )}
            {items.length === 0 && (
              <span className="text-[10px] uppercase tracking-wider text-success">No issues</span>
            )}
          </div>
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3 animate-in fade-in">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border transition",
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-xs text-muted-foreground italic py-4 text-center">No items at this severity.</div>
          )}
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl p-3 bg-background/40 border border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium">{item.title}</div>
                <SeverityBadge severity={item.severity} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
