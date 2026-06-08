import type { AnalysisResult } from "@/lib/sdlc-data";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export function SdlcCharts({ result }: { result: AnalysisResult }) {
  const radarData = [
    { metric: "Requirements", value: result.requirementHealthScore },
    { metric: "Development", value: result.developmentCompletenessScore },
    { metric: "Testing", value: result.testCoverageScore },
    { metric: "Release", value: result.releaseConfidenceScore },
    { metric: "Security", value: 100 - result.securityRisks.length * 12 },
    { metric: "Architecture", value: 100 - result.architecturalRisks.length * 10 },
  ];

  const riskBarData = [
    { name: "Missing Reqs", count: result.missingRequirements.length },
    { name: "Missing Impl", count: result.missingImplementations.length },
    { name: "Technical", count: result.technicalRisks.length },
    { name: "Security", count: result.securityRisks.length },
    { name: "Testing", count: result.testingRisks.length },
    { name: "Architectural", count: result.architecturalRisks.length },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="glass rounded-2xl p-5 shadow-elegant">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">SDLC Impact Radar</div>
            <div className="text-xs text-muted-foreground">Cross-discipline readiness</div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 9 }} stroke="var(--color-border)" />
              <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.35} />
              <Tooltip
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 shadow-elegant">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Risk Distribution</div>
            <div className="text-xs text-muted-foreground">Open items by category</div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskBarData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} interval={0} angle={-20} dy={10} height={50} stroke="var(--color-border)" />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} stroke="var(--color-border)" />
              <Tooltip
                cursor={{ fill: "var(--color-accent)", opacity: 0.4 }}
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 shadow-elegant lg:col-span-2">
        <div className="text-sm font-semibold mb-3">Readiness Progress</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Requirement Completeness", v: result.requirementHealthScore, color: "var(--color-primary)" },
            { label: "Development Progress", v: result.developmentCompletenessScore, color: "var(--color-info)" },
            { label: "Test Coverage", v: result.testCoverageScore, color: "var(--color-warning)" },
            { label: "Release Readiness", v: result.releaseConfidenceScore, color: "var(--color-success)" },
          ].map((p) => (
            <div key={p.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">{p.label}</span>
                <span className="text-xs font-mono font-semibold">{p.v}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.v}%`, backgroundColor: p.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
