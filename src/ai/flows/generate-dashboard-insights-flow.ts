'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating dynamic dashboard insights.
 * It processes inventory, sales, and forecast data to produce UI widgets and urgent alerts
 * for quick-commerce managers.
 *
 * - generateDashboardInsights - A function that orchestrates the generation of dashboard insights.
 * - DashboardInsightsInput - The input type for the generateDashboardInsights function.
 * - DashboardInsightsOutput - The return type for the generateDashboardInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DashboardInsightsInputSchema = z.object({
  currentInventoryStatus: z.string().describe("A comprehensive summary of the current inventory levels across various SKUs, including quantities, locations, and last update times."),
  recentSalesData: z.string().describe("An aggregated summary of recent sales trends and velocities for key products, identifying fast-moving or slow-moving items."),
  predictiveForecast: z.string().describe("A summary of the predictive demand forecast for the next 4 hours, highlighting anticipated spikes or dips in demand for specific SKUs."),
});
export type DashboardInsightsInput = z.infer<typeof DashboardInsightsInputSchema>;

const DashboardWidgetSchema = z.object({
  id: z.string().describe("Unique identifier for the widget (e.g., 'low-stock-alert-card', 'sales-velocity-chart')."),
  type: z.enum(["card", "chart", "table", "text"]).describe("The visual type of UI widget to display (e.g., 'card' for key metrics, 'chart' for trends, 'table' for detailed lists, 'text' for general information)."),
  title: z.string().describe("Concise title for the dashboard widget (e.g., 'SKUs At Risk', 'Top Selling Items')."),
  content: z.string().describe("The core information or data summary for the widget. For charts, this might describe the data points; for cards, a key metric."),
  urgency: z.enum(["low", "medium", "high", "critical"]).describe("The urgency level associated with the insights presented in this widget, influencing its visual prominence."),
  recommendation: z.string().describe("A brief, actionable recommendation or strategic insight derived from the widget's content."),
});

const DashboardAlertSchema = z.object({
  id: z.string().describe("Unique identifier for the alert (e.g., 'ghost-stock-alert-SKU123')."),
  message: z.string().describe("The clear and concise alert message, informing the manager about a critical issue."),
  severity: z.enum(["info", "warning", "error", "critical"]).describe("The severity level of the alert, dictating its visual treatment and priority."),
  actionRequired: z.string().describe("Specific, immediate action required to address the alert (e.g., 'Restock SKU-456 from warehouse A immediately')."),
});

const DashboardInsightsOutputSchema = z.object({
  widgets: z.array(DashboardWidgetSchema).describe("A list of custom UI widgets generated dynamically based on critical inventory insights."),
  alerts: z.array(DashboardAlertSchema).describe("A list of urgent alerts highlighting immediate issues and requiring manager attention."),
});
export type DashboardInsightsOutput = z.infer<typeof DashboardInsightsOutputSchema>;

export async function generateDashboardInsights(input: DashboardInsightsInput): Promise<DashboardInsightsOutput> {
  return generateDashboardInsightsFlow(input);
}

const generateDashboardInsightsPrompt = ai.definePrompt({
  name: 'generateDashboardInsightsPrompt',
  input: { schema: DashboardInsightsInputSchema },
  output: { schema: DashboardInsightsOutputSchema },
  prompt: `You are an expert Quick-Commerce Inventory Manager AI. Your task is to analyze the provided real-time data and generate a structured JSON object containing a list of dynamic UI widgets and urgent alerts for a quick-commerce dashboard.
Focus on identifying critical inventory insights, potential 'Ghost Stocks', stockout risks, and opportunities for optimization. The goal is to provide immediate, actionable information to a quick-commerce manager, enabling them to make informed decisions and address pressing issues.

Here is the current data summary:
---
Current Inventory Status: {{{currentInventoryStatus}}}
---
Recent Sales Data: {{{recentSalesData}}}
---
Predictive Demand Forecast (next 4 hours): {{{predictiveForecast}}}
---

Carefully analyze this data to identify:
- Any SKUs likely to experience 'Ghost Stocks' (inventory discrepancies) or run out in the next 4 hours based on sales velocity and predictive demand.
- Any SKUs with unusually high or low sales velocity requiring immediate attention or strategic adjustment.
- Any significant discrepancies between current stock levels and the predictive demand forecast.
- Any general inventory health issues, overstock situations, or potential waste.

Based on your thorough analysis, generate a list of relevant dashboard widgets and urgent alerts. Ensure that:
- Each widget provides a clear title, type (card, chart, table, text), content summarizing the insight, an urgency level (low, medium, high, critical), and a concise recommendation.
- Each alert provides a clear message, severity (info, warning, error, critical), and specific, actionable steps required.
- The 'id' for each widget and alert is unique and descriptive.

Your output MUST be a valid JSON object matching the provided schema, with no additional text or formatting outside the JSON.
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
