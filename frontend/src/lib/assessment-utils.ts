import type { AnalysisResult } from "@/lib/sdlc-data";

const STORAGE_KEY = "sdlc-guardian:assessments";

export interface SavedAssessment {
  id: string;
  savedAt: string;
  result: AnalysisResult;
  inputs: { requirement: string; dev: string; tests: string };
}

export function saveAssessment(result: AnalysisResult, inputs: SavedAssessment["inputs"]): SavedAssessment {
  const entry: SavedAssessment = {
    id: `a_${Date.now()}`,
    savedAt: new Date().toISOString(),
    result,
    inputs,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: SavedAssessment[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    if (import.meta.env.DEV) console.error("saveAssessment failed", e);
  }

  return entry;
}

export function exportPdf(result: AnalysisResult) {
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  const safe = (s: unknown) => String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] || c));
  const list = (items?: string[]) =>
    !items || items.length === 0
      ? `<p style="color:#777;font-style:italic">None</p>`
      : `<ul>${items.map((i) => `<li>${safe(i)}</li>`).join("")}</ul>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
    <title>SDLC Guardian Report — ${safe(result.projectName)}</title>
    <style>
      *{box-sizing:border-box} body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:40px;max-width:820px;margin:auto}
      h1{font-size:24px;margin:0 0 4px} h2{font-size:16px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
      .meta{color:#666;font-size:12px;margin-bottom:24px}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:12px 0}
      .card{border:1px solid #e5e5e5;border-radius:8px;padding:12px}
      .k{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#666}
      .v{font-size:20px;font-weight:700;margin-top:2px}
      .badge{display:inline-block;padding:3px 8px;border-radius:99px;font-size:11px;font-weight:600;border:1px solid}
      .GO{background:#e7f6ec;color:#1a7f37;border-color:#a3d9b1}
      .GO_WITH_RISK{background:#fff4e0;color:#9a6700;border-color:#f0c674}
      .NO_GO{background:#ffe7e7;color:#a40e26;border-color:#f0a0a0}
      p{white-space:pre-wrap;word-break:break-word}
      ul{padding-left:20px;margin:6px 0}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>AI SDLC Guardian — Assessment Report</h1>
    <div class="meta">${safe(result.projectName)} · Generated ${new Date().toLocaleString()}</div>

    <div class="grid">
      <div class="card"><div class="k">Release Recommendation</div><div class="v"><span class="badge ${result.releaseRecommendation}">${safe(result.releaseRecommendation).replace(/_/g, " ")}</span></div></div>
      <div class="card"><div class="k">Confidence</div><div class="v">${safe(result.releaseConfidenceScore)}%</div></div>
      <div class="card"><div class="k">Risk Level</div><div class="v">${safe(result.riskLevel ?? "N/A")}</div></div>
      <div class="card"><div class="k">Security Score</div><div class="v">${result.securityScore ?? "Pending"}</div></div>
      <div class="card"><div class="k">Requirement Health</div><div class="v">${safe(result.requirementHealthScore)}</div></div>
      <div class="card"><div class="k">Development</div><div class="v">${safe(result.developmentCompletenessScore)}</div></div>
      <div class="card"><div class="k">Test Coverage</div><div class="v">${safe(result.testCoverageScore)}</div></div>
      <div class="card"><div class="k">Security Risk</div><div class="v">${safe(result.securityRiskLevel ?? "N/A")}</div></div>
    </div>

    <h2>Executive Summary</h2>
    <p>${safe(result.executiveSummary) || "<em>No summary returned.</em>"}</p>

    <h2>Critical Blockers</h2>
    ${list(result.criticalBlockers?.length ? result.criticalBlockers : result.topCriticalRisks)}

    <h2>Required Actions Before Release</h2>
    ${list(result.requiredActionsBeforeRelease)}

    <h2>Critical Vulnerabilities</h2>
    ${list(result.criticalVulnerabilities)}

    <h2>Security Recommendations</h2>
    ${list(result.securityRecommendations)}

    <h2>Deployment Notes</h2>
    <p>${safe(result.deploymentNotes) || "<em>None.</em>"}</p>

    <script>window.onload = () => { setTimeout(() => window.print(), 300); };</script>
    </body></html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
