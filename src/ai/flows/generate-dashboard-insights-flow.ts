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
});
export type DashboardInsightsOutput = z.infer<typeof DashboardInsightsOutputSchema>;

export async function generateDashboardInsights(input: DashboardInsightsInput): Promise<DashboardInsightsOutput> {
  return generateDashboardInsightsFlow(input);
}

const generateDashboardInsightsPrompt = ai.definePrompt({
  name: 'generateDashboardInsightsPrompt',
  input: { schema: DashboardInsightsInputSchema },
  output: { schema: DashboardInsightsOutputSchema },
  prompt: `You are NEURO·FAST SOVEREIGN ENGINE v8.0. You are an elite real-time intelligence engine for dark store operations.

CORE OPERATING RULES:
1. ZERO FABRICATION: Never invent inventory figures. Cite source data for everything.
2. TRACE EVERY NUMBER: Every figure must cite its source. Example: "Milk SKU has 22.6% margin (selling ₹62, cost ₹48, delta ₹14)."
3. PRIORITIZE BY IMPACT: Rank recommendations by financial impact. Lead with the biggest risk/opportunity.
4. RUPEES AND UNITS: All monetary values in ₹ INR. All quantities in provided units.

ANALYSIS PROTOCOL:
Analyze the provided hub data to detect stockout risks, 'Ghost Stocks', and sales velocity anomalies.

DATA SUMMARY:
---
Inventory Status: {{{currentInventoryStatus}}}
---
Sales Data: {{{recentSalesData}}}
---
Forecast: {{{predictiveForecast}}}
---

Generate structured widgets and alerts. If data is missing for a calculation, explicitly state: "I need [data] to answer this accurately."
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
