import { useState } from "react";
import type { AnalysisResult } from "@/lib/sdlc-data";
import { Code2, TestTube2, Building2, BriefcaseBusiness, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "developer", label: "Developer", icon: Code2 },
  { id: "tester", label: "Tester", icon: TestTube2 },
  { id: "architect", label: "Architect", icon: Building2 },
  { id: "productManager", label: "Product Manager", icon: BriefcaseBusiness },
  { id: "releaseManager", label: "Release Manager", icon: GitBranch },
] as const;

type TabId = typeof TABS[number]["id"];

export function StakeholderView({ result }: { result: AnalysisResult }) {
  const [active, setActive] = useState<TabId>("developer");
  const insights = result.stakeholderInsights[active];

  return (
    <div className="glass rounded-2xl shadow-elegant overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background/30">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition",
              active === id
                ? "bg-primary text-primary-foreground shadow-elegant"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      <div className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          AI-generated insights for {TABS.find((t) => t.id === active)?.label}
        </div>
        <ul className="space-y-2.5">
          {insights.map((ins, i) => (
            <li key={i} className="flex gap-3 p-3 rounded-xl bg-background/40 border border-border">
              <div className="size-6 rounded-md gradient-primary grid place-items-center shrink-0 text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </div>
              <span className="text-sm leading-relaxed">{ins}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
