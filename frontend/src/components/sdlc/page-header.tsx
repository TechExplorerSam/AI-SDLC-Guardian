import type { ReactNode } from "react";
import { ChevronRight, Shield } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="glass-strong rounded-3xl p-6 md:p-7 relative overflow-hidden shadow-elegant">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-32 -left-16 size-72 rounded-full blur-3xl bg-gradient-to-br from-primary/40 to-chart-4/30" />
        <div className="absolute -bottom-24 -right-12 size-72 rounded-full blur-3xl bg-gradient-to-tr from-info/30 to-success/20" />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <Shield className="size-3.5" />
            AI SDLC Guardian
            {eyebrow && (<><ChevronRight className="size-3" /><span>{eyebrow}</span></>)}
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function EmptyState({ title, description, icon: Icon, action }: { title: string; description?: string; icon?: React.ComponentType<{ className?: string }>; action?: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-10 text-center shadow-elegant">
      {Icon && <Icon className="mx-auto size-8 text-muted-foreground mb-3" />}
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">{description}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
