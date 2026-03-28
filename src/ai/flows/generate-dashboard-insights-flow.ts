
'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating dynamic dashboard insights.
 * It uses the NEURO·FAST SOVEREIGN ENGINE v8.0 protocol for precision hub analytics.
 *
 * - generateDashboardInsights - A function that orchestrates the generation of dashboard insights.
 * - DashboardInsightsInput - The input type for the generateDashboardInsights function.
 * - DashboardInsightsOutput - The return type for the generateDashboardInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DashboardInsightsInputSchema = z.object({
  currentInventoryStatus: z.string().describe("A comprehensive summary of the current inventory levels across various SKUs."),
  recentSalesData: z.string().describe("An aggregated summary of recent sales trends and velocities for key products."),
  predictiveForecast: z.string().describe("A summary of the predictive demand forecast for the next 4 hours."),
  storeId: z.string().optional().describe("The ID of the dark store being analyzed."),
});
export type DashboardInsightsInput = z.infer<typeof DashboardInsightsInputSchema>;

const DashboardWidgetSchema = z.object({
  id: z.string().describe("Unique identifier for the widget."),
  type: z.enum(["card", "chart", "table", "text"]).describe("The visual type of UI widget."),
  title: z.string().describe("Concise title for the dashboard widget."),
  content: z.string().describe("The core information. Trace every number to the source data."),
  urgency: z.enum(["low", "medium", "high", "critical"]).describe("The urgency level."),
  recommendation: z.string().describe("Actionable strategic insight derived from calculations."),
});

const DashboardAlertSchema = z.object({
  id: z.string().describe("Unique identifier for the alert."),
  message: z.string().describe("Concise alert message."),
  severity: z.enum(["info", "warning", "error", "critical"]).describe("The severity level."),
  actionRequired: z.string().describe("Specific, immediate action required."),
});

const DashboardInsightsOutputSchema = z.object({
  widgets: z.array(DashboardWidgetSchema).describe("List of custom UI widgets."),
  alerts: z.array(DashboardAlertSchema).describe("List of urgent alerts."),
  intelligenceBrief: z.string().describe("The full text of the NEURO·FAST Intelligence Brief following v8.0 protocol."),
});
export type DashboardInsightsOutput = z.infer<typeof DashboardInsightsOutputSchema>;

export async function generateDashboardInsights(input: DashboardInsightsInput): Promise<DashboardInsightsOutput> {
  return generateDashboardInsightsFlow(input);
}

const generateDashboardInsightsPrompt = ai.definePrompt({
  name: 'generateDashboardInsightsPrompt',
  input: { schema: DashboardInsightsInputSchema },
  output: { schema: DashboardInsightsOutputSchema },
  prompt: `
# NEURO·FAST SOVEREIGN ENGINE — MASTER SYSTEM PROMPT
# Version 8.0 | Dark Store Intelligence Protocol

## IDENTITY
You are NEURO·FAST, an elite real-time intelligence engine built exclusively for dark store and quick-commerce hub operations. You are not a general assistant. You are a precision analytics system that reads ONLY the real data provided by the hub operator and generates specific, actionable intelligence from it.

You never simulate. You never estimate. You never generate example numbers. If data is missing, you ask for it. Every insight you give must trace directly back to a real number the operator gave you.

---

## CORE OPERATING RULES

### RULE 1 — ZERO FABRICATION
Never invent inventory figures, demand predictions, or market comparisons unless the operator has given you historical data to base them on. If you lack data to answer, say: "I need [specific data] to answer this accurately. Please provide it."

### RULE 2 — REAL DATA FIRST
Confirm you have the context below.

### RULE 3 — TRACE EVERY NUMBER
Every figure in your response must cite its source. Example:
"Your milk SKU has a 22.6% margin (selling ₹62, cost ₹48, delta ₹14)."
Never give a percentage without showing the calculation.

### RULE 4 — PRIORITIZE BY IMPACT
Always rank your recommendations by financial impact. Lead with the biggest opportunity or most urgent risk.

### RULE 5 — SPEAK IN RUPEES AND UNITS
All monetary values in ₹ INR.

---

## ANALYTICAL FRAMEWORKS

### MARGIN HEALTH TRIAGE
- Critical (margin < 15%)
- Warning (margin 15–25%)
- Healthy (margin 25–40%)
- Premium (margin > 40%)

### STOCK RISK MATRIX
Calculate Days_Cover = current_stock / average_daily_demand.
- CRITICAL: stock = 0 or stock ≤ reorder_point
- WARNING: stock ≤ reorder_point × 1.5
- SAFE: stock > reorder_point × 1.5

---

## DATA SUMMARY
Store ID: {{{storeId}}}
Inventory Status: {{{currentInventoryStatus}}}
Sales Data: {{{recentSalesData}}}
Predictive Forecast: {{{predictiveForecast}}}

Generate the full INTELLIGENCE BRIEF text as specified in the v8.0 protocol in the 'intelligenceBrief' field. Also populate 'widgets' and 'alerts' for the dashboard UI.
`,
});

const generateDashboardInsightsFlow = ai.defineFlow(
  {
    name: 'generateDashboardInsightsFlow',
    inputSchema: DashboardInsightsInputSchema,
    outputSchema: DashboardInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await generateDashboardInsightsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate dashboard insights.');
    }
    return output;
  }
);
