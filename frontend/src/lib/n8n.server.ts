// Server-only helper for proxying calls to the n8n backend.
// Reads the bearer token at request time (Cloudflare Workers inject env per-request).

const DEFAULT_BASE = "https://rockyrockerz234.app.n8n.cloud/webhook";

const ENDPOINTS = {
  analyze: "analyze-project",
  history: "release-history",
  insights: "ai-insights",
  reports: "reports",
  riskCenter: "risk-center",
  health: "health",
  releaseDetails: "release-details",
} as const;

export type N8nEndpoint = keyof typeof ENDPOINTS;

function getBase(): string {
  return process.env.N8N_BASE_URL || DEFAULT_BASE;
}

function getAuthHeader(): Record<string, string> {
  const token = process.env.N8N_WEBHOOK_TOKEN;
  if (!token) return {};
  return { "x-n8n-secret": token };
}

export interface N8nFetchOptions {
  endpoint: N8nEndpoint;
  method?: "GET" | "POST";
  query?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

export async function callN8n({
  endpoint,
  method = "GET",
  query,
  body,
  timeoutMs = 60000,
}: N8nFetchOptions): Promise<unknown> {
  const path = ENDPOINTS[endpoint];
  const qs = query
    ? "?" + new URLSearchParams(query).toString()
    : "";
  const url = `${getBase()}/${path}${qs}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...getAuthHeader(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      // Don't leak upstream body to clients.
      throw new Error(`Upstream ${endpoint} responded ${res.status}`);
    }
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON from ${endpoint}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
