'use server';
/**
 * @fileOverview NEURO·FAST SOVEREIGN v9.0 APEX — Master Intelligence Brief Flow
 * This flow orchestrates the generation of full store status reports following
 * the v9.0 Apex protocol.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DashboardInsightsInputSchema = z.object({
  storeProfile: z.string().describe("BLOCK A: Hub identifier, platform, location, and historical context."),
  inventorySnapshot: z.string().describe("BLOCK B: Full array of SKUs with stock, prices, and margins."),
  auditLog: z.string().describe("BLOCK C: Recent activity events for anomaly detection."),
  previousAnalyses: z.string().optional().describe("BLOCK D: Continuity data from prior sessions."),
});
export type DashboardInsightsInput = z.infer<typeof DashboardInsightsInputSchema>;

const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(["card", "chart", "table", "text"]),
  title: z.string(),
  content: z.string(),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  recommendation: z.string(),
});

const DashboardAlertSchema = z.object({
  id: z.string(),
  message: z.string(),
  severity: z.enum(["info", "warning", "error", "critical"]),
  actionRequired: z.string(),
});

const DashboardInsightsOutputSchema = z.object({
  intelligenceBrief: z.string().describe("The full v9.0 APEX Intelligence Brief following the exact response architecture."),
  widgets: z.array(DashboardWidgetSchema),
  alerts: z.array(DashboardAlertSchema),
});
export type DashboardInsightsOutput = z.infer<typeof DashboardInsightsOutputSchema>;

const systemPrompt = `
╔══════════════════════════════════════════════════════════════════════════════════╗
║           NEURO·FAST  SOVEREIGN  INTELLIGENCE  ENGINE                           ║
║           MASTER OPERATING SYSTEM — VERSION 9.0 APEX                           ║
╚══════════════════════════════════════════════════════════════════════════════════╝

IDENTITY: You are NEURO·FAST SOVEREIGN, a cognitive command layer.
LAW: ZERO FABRICATION. Every number must come from the provided data.
LAW: SHOW YOUR WORK. Every percentage calculation must be visible.

FRAMEWORKS TO APPLY:
1. MARGIN HEALTH TRIAGE (Haemorrhage <0%, Critical <15%, Warning <25%, Healthy <40%)
2. STOCK RISK MATRIX (Stockout=0, Critical <= ROP, Warning <= ROP*1.5)
3. CAPITAL EFFICIENCY (Profit Share / Capital Share ratio)
4. PROFIT POOL COMMAND (Concentration risk analysis)

RESPONSE ARCHITECTURE:
- BLOCK 0: CRISIS ALERTS (if detected)
- BLOCK 1: INTELLIGENCE BRIEF HEADER
- BLOCK 3: IMMEDIATE COMMAND ACTIONS (Ranked by Financial Impact)
- BLOCK 4: KEY FINDINGS (With full calculations)
- BLOCK 5: FINANCIAL COMMAND DASHBOARD
- BLOCK 8: SIGNATURE
`;

const prompt = ai.definePrompt({
  name: 'generateDashboardInsightsPromptV9',
  input: { schema: DashboardInsightsInputSchema },
  output: { schema: DashboardInsightsOutputSchema },
  prompt: `
${systemPrompt}

OPERATOR DATA:
STORE PROFILE: {{{storeProfile}}}
INVENTORY SNAPSHOT: {{{inventorySnapshot}}}
AUDIT LOG: {{{auditLog}}}
PREVIOUS ANALYSES: {{{previousAnalyses}}}

Execute MODE 1 (Full Analysis). Deliver the complete Intelligence Brief and populate the dashboard UI widgets.
`,
});

export async function generateDashboardInsights(input: DashboardInsightsInput): Promise<DashboardInsightsOutput> {
  try {
    const { output } = await prompt(input);
    if (!output) throw new Error('Sovereign Engine failed to generate intelligence brief.');
    return output;
  } catch (error: any) {
    console.error("AI Flow Error (generateDashboardInsights):", error);
    throw new Error(error.message || "Uplink to Sovereign Engine timed out.");
  }
}
