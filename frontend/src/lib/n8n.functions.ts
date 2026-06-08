import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callN8n } from "./n8n.server";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const analyzeSchema = z.object({
  requirement: z.string().trim().min(1).max(8000),
  changeSummary: z.string().trim().min(1).max(8000),
  testingSummary: z.string().trim().min(1).max(8000),
});

export const analyzeProjectFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => analyzeSchema.parse(data))
  .handler(async ({ data }): Promise<Json> => {
    return (await callN8n({ endpoint: "analyze", method: "POST", body: data })) as Json;
  });

export const releaseHistoryFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<Json> => (await callN8n({ endpoint: "history" })) as Json);

export const aiInsightsFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<Json> => (await callN8n({ endpoint: "insights" })) as Json);

export const reportsFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<Json> => (await callN8n({ endpoint: "reports" })) as Json);

export const riskCenterFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<Json> => (await callN8n({ endpoint: "riskCenter" })) as Json);

export const healthFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<Json> => {
    try {
      return (await callN8n({ endpoint: "health", timeoutMs: 10000 })) as Json;
    } catch (e) {
      return { status: "DOWN", message: e instanceof Error ? e.message : "Unreachable", timestamp: new Date().toISOString() };
    }
  });

const releaseDetailsSchema = z.object({
  releaseId: z.string().trim().min(1).max(256).regex(/^[A-Za-z0-9_\-:.]+$/),
});

export const releaseDetailsFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => releaseDetailsSchema.parse(data))
  .handler(async ({ data }): Promise<Json> => {
    return (await callN8n({ endpoint: "releaseDetails", query: { releaseId: data.releaseId } })) as Json;
  });

// Returns ONLY whether the server-side N8N_WEBHOOK_TOKEN secret is configured.
// Never returns the value itself.
export const tokenStatusFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ configured: boolean }> => {
    return { configured: Boolean(process.env.N8N_WEBHOOK_TOKEN) };
  });
