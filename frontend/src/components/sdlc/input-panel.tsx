import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  reqs: string; setReqs: (v: string) => void;
  dev: string; setDev: (v: string) => void;
  tests: string; setTests: (v: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

const cards = [
  {
    key: "reqs", title: "Requirement Input",
    placeholder: "Paste user stories, BRD, requirement document, Jira story, or feature description",
    accent: "from-primary/40 to-chart-4/30",
  },
  {
    key: "dev", title: "Development Change Summary",
    placeholder: "Describe implemented changes, APIs, modules, database changes, and integrations",
    accent: "from-info/40 to-primary/30",
  },
  {
    key: "tests", title: "Testing Summary",
    placeholder: "Paste executed test cases, test results, coverage summary, defects, and QA notes",
    accent: "from-warning/40 to-success/30",
  },
] as const;

export function InputPanel({ reqs, setReqs, dev, setDev, tests, setTests, onAnalyze, loading }: Props) {
  const values = { reqs, dev, tests };
  const setters = { reqs: setReqs, dev: setDev, tests: setTests };

  return (
    <section className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.key} className="relative glass rounded-2xl p-5 shadow-elegant overflow-hidden group hover:shadow-glow transition-shadow">
            <div className={`absolute -top-20 -right-20 size-56 rounded-full blur-3xl bg-gradient-to-br ${c.accent} opacity-50 pointer-events-none`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{c.title}</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {values[c.key].length} chars
                </span>
              </div>
              <textarea
                value={values[c.key]}
                onChange={(e) => setters[c.key](e.target.value)}
                placeholder={c.placeholder}
                className="w-full h-44 resize-none rounded-xl bg-background/50 border border-border p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-2xl p-4 shadow-elegant">
        <div className="text-xs text-muted-foreground max-w-md">
          Our multi-agent AI evaluates requirements, implementation, and tests in parallel to surface risks and release readiness.
        </div>
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-70 hover:scale-[1.02] transition"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              AI Agents Analyzing Project…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Analyze Project
            </>
          )}
        </button>
      </div>
    </section>
  );
}
