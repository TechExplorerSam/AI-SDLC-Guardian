import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ArrowLeft } from "lucide-react";

export function StubPage({ title, blurb }: { title: string; blurb: string }) {
  return (
    <AppShell>
      <div className="glass-strong rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto mt-12 shadow-elegant">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Coming Soon</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight gradient-text">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{blurb}</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm shadow-glow">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
