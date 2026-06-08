import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/sdlc-data";

const MAP: Record<RiskLevel, string> = {
  LOW: "bg-success/15 text-success border-success/30",
  MEDIUM: "bg-warning/15 text-warning border-warning/30",
  HIGH: "bg-destructive/15 text-destructive border-destructive/30",
  UNKNOWN: "bg-muted text-muted-foreground border-border",
};

export function RiskLevelBadge({ level, className }: { level?: string; className?: string }) {
  const key = (String(level ?? "UNKNOWN").toUpperCase() as RiskLevel) in MAP
    ? (String(level ?? "UNKNOWN").toUpperCase() as RiskLevel)
    : "UNKNOWN";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] border",
        MAP[key],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {key === "UNKNOWN" ? "N/A" : key} Risk
    </span>
  );
}
