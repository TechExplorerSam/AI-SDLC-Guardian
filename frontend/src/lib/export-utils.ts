// Recursively strip fields we never want to ship in user exports:
//  - `raw` (original backend payload, may include extra fields)
//  - any key that looks like a secret/token/credential
const SECRET_KEY_RE = /(token|secret|api[-_]?key|authorization|password|credential)/i;

function sanitizeForExport(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForExport);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "raw") continue;
      if (SECRET_KEY_RE.test(k)) continue;
      out[k] = sanitizeForExport(v);
    }
    return out;
  }
  return value;
}

export function exportJson(data: unknown, filename = `sdlc-export-${Date.now()}.json`) {
  if (typeof window === "undefined") return;
  const safe = sanitizeForExport(data);
  const blob = new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


export function exportCsv<T extends object>(rows: T[], filename = `sdlc-export-${Date.now()}.csv`) {
  if (typeof window === "undefined" || rows.length === 0) return;
  const keys = Object.keys(rows[0]) as (keyof T)[];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => escape((r as Record<string, unknown>)[k as string])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
