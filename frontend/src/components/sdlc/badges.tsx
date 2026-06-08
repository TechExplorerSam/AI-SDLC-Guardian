import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/sdlc-data";

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const map: Record<Severity, { label: string; cls: string }> = {
    critical: { label: "Critical", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    high: { label: "High", cls: "bg-warning/15 text-warning border-warning/30" },
    medium: { label: "Medium", cls: "bg-info/15 text-info border-info/30" },
    low: { label: "Low", cls: "bg-success/15 text-success border-success/30" },
  };
  const m = map[severity];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border", m.cls, className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

export function StatusBadge({ score }: { score: number }) {
  const { label, cls } =
    score >= 85 ? { label: "Excellent", cls: "bg-success/15 text-success border-success/30" } :
    score >= 70 ? { label: "Good", cls: "bg-info/15 text-info border-info/30" } :
    score >= 50 ? { label: "Warning", cls: "bg-warning/15 text-warning border-warning/30" } :
                  { label: "Critical", cls: "bg-destructive/15 text-destructive border-destructive/30" };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border", cls)}>
      {label}
    </span>
  );
}

export function ScoreRing({ score, size = 96, label }: { score: number; size?: number; label?: string }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color =
    score >= 85 ? "var(--color-success)" :
    score >= 70 ? "var(--color-primary)" :
    score >= 50 ? "var(--color-warning)" : "var(--color-destructive)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--color-muted)" strokeWidth={stroke} fill="none" opacity={0.4} />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold tracking-tight tabular-nums">{score}</div>
          {label && <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>}
        </div>
      </div>
    </div>
  );
}
