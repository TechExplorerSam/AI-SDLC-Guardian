import { Shield, ShieldAlert, Activity, Layers, GitBranch, Bell, Search, FileBarChart2, Settings, Moon, Sun, User, RefreshCcw } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, setTheme, type Theme } from "@/lib/theme";
import { getHealth, type NormalizedHealth } from "@/lib/api";

const nav = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/risks", label: "Risk Center", icon: ShieldAlert },
  { to: "/insights", label: "AI Insights", icon: Layers },
  { to: "/releases", label: "Release History", icon: GitBranch },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function HealthBadge({ health }: { health: NormalizedHealth | null }) {
  // Surface only Connected / Disconnected / Checking — never raw backend payload.
  const connected = health?.status === "OK";
  const checking = health == null;
  const cls = checking ? "text-muted-foreground bg-muted border-border"
    : connected ? "text-success bg-success/15 border-success/40"
    : "text-destructive bg-destructive/15 border-destructive/40";
  const dot = checking ? "bg-muted-foreground" : connected ? "bg-success" : "bg-destructive";
  const label = checking ? "Checking…" : connected ? "Connected" : "Disconnected";
  return (
    <span title={checking ? "Checking backend status…" : connected ? "Backend connected" : "Backend disconnected"} className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${cls}`}>
      <span className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [theme, setThemeState] = useState<Theme>("dark");
  const [health, setHealth] = useState<NormalizedHealth | null>(null);
  useEffect(() => { const t = getStoredTheme(); setThemeState(t); applyTheme(t); }, []);
  useEffect(() => {
    let cancelled = false;
    const tick = async () => { const h = await getHealth(); if (!cancelled) setHealth(h); };
    void tick();
    const id = setInterval(tick, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);
  const cycleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setThemeState(next); setTheme(next);
  };
  const globalRefresh = () => { window.dispatchEvent(new CustomEvent("sdlc:refresh")); window.location.reload(); };
  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col glass-strong border-r border-border shrink-0 sticky top-0 h-screen">

        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-border">
          <div className="size-9 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Shield className="size-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">SDLC Guardian</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI Intelligence</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elegant"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="glass rounded-xl p-3">
            <div className="text-xs font-medium">Project Health</div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="size-2 rounded-full bg-success pulse-ring" />
              <span className="text-xs text-muted-foreground">All systems analyzed</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 glass-strong border-b border-border">
          <div className="flex items-center gap-3 px-4 md:px-8 h-14">
            <div className="md:hidden size-8 rounded-lg gradient-primary grid place-items-center">
              <Shield className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search projects, risks, requirements…"
                className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/60 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <HealthBadge health={health} />
              <button onClick={globalRefresh} aria-label="Global refresh" title="Refresh" className="size-9 grid place-items-center rounded-lg glass hover:bg-accent transition">
                <RefreshCcw className="size-4" />
              </button>
              <button onClick={cycleTheme} aria-label={`Theme: ${theme}`} title={`Theme: ${theme}`} className="size-9 grid place-items-center rounded-lg glass hover:bg-accent transition">
                {theme === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button onClick={() => window.dispatchEvent(new CustomEvent("sdlc:notify"))} className="size-9 grid place-items-center rounded-lg glass hover:bg-accent transition" aria-label="Notifications">
                <Bell className="size-4" />
              </button>
              <Link to="/profile" aria-label="Profile" className="size-9 rounded-full bg-gradient-to-br from-primary to-chart-4 grid place-items-center text-xs font-semibold text-primary-foreground hover:opacity-90 transition">
                AG
              </Link>

            </div>
          </div>
        </header>
        <nav className="md:hidden border-b border-border bg-background/60 backdrop-blur overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60")}>
                  <Icon className="size-3.5" /> {label}
                </Link>
              );
            })}
          </div>
        </nav>
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

