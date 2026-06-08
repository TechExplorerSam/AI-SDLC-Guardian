import { useEffect, useState } from "react";

export interface AppSettings {
  organizationName: string;
  environment: "development" | "staging" | "production";
  timezone: string;
  aiProvider: "openai" | "anthropic" | "gemini" | "lovable";
  aiModel: string;
  confidenceThreshold: number;
  // API URLs
  webhookUrl: string;       // analyze-project
  historyUrl: string;       // release-history
  insightsUrl: string;      // ai-insights
  reportsUrl: string;       // reports
  riskCenterUrl: string;    // risk-center
  healthUrl: string;        // health
  releaseDetailsUrl: string;// release-details (without query)
  apiTimeoutMs: number;
  retryCount: number;
  emailNotifications: boolean;
  releaseAlerts: boolean;
  riskAlerts: boolean;
  theme: "dark" | "light" | "system";
}

const N8N = "https://rockyrockerz234.app.n8n.cloud/webhook";

export const DEFAULT_SETTINGS: AppSettings = {
  organizationName: "Acme Corporation",
  environment: "production",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  aiProvider: "openai",
  aiModel: "gpt-4o",
  confidenceThreshold: 75,
  webhookUrl: `${N8N}/analyze-project`,
  historyUrl: `${N8N}/release-history`,
  insightsUrl: `${N8N}/ai-insights`,
  reportsUrl: `${N8N}/reports`,
  riskCenterUrl: `${N8N}/risk-center`,
  healthUrl: `${N8N}/health`,
  releaseDetailsUrl: `${N8N}/release-details`,
  apiTimeoutMs: 60000,
  retryCount: 2,
  emailNotifications: true,
  releaseAlerts: true,
  riskAlerts: true,
  theme: "dark",
};

const KEY = "sdlc:settings";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent("sdlc:settings", { detail: s }));
}

export function useSettings(): [AppSettings, (s: AppSettings) => void] {
  const [s, setS] = useState<AppSettings>(() => loadSettings());
  useEffect(() => {
    const fn = (e: Event) => setS((e as CustomEvent<AppSettings>).detail);
    window.addEventListener("sdlc:settings", fn);
    return () => window.removeEventListener("sdlc:settings", fn);
  }, []);
  const update = (next: AppSettings) => { saveSettings(next); setS(next); };
  return [s, update];
}
