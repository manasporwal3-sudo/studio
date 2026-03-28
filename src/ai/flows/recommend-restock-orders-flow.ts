
'use server';
/**
 * @fileOverview AI-powered procurement assistant using SOVEREIGN ENGINE v8.0 protocol.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendRestockOrdersInputSchema = z.object({
  skus: z
    .array(
      z.object({
        id: z.string().describe('SKU ID.'),
        name: z.string().describe('SKU Name.'),
        currentStock: z.number().int().describe('Current stock.'),
        reorderPoint: z.number().int().describe('SKU reorder point.'),
        predictedDemand4Hours: z
          .number()
          .int()
          .describe('Predicted demand (4h).'),
        salesVelocity24Hours: z
          .number()
          .int()
          .describe('Sales velocity (24h).'),
        supplierLeadTimeDays: z
          .number()
          .int()
          .describe('Lead time in days.'),
        minimumOrderQuantity: z
          .number()
          .int()
          .describe('MOQ.'),
        sellingPrice: z.number().describe('Selling Price (INR).'),
        costPrice: z.number().describe('Cost Price (INR).'),
        supplierName: z.string().describe('Primary supplier.'),
      })
    )
    .describe('Array of SKU data.'),
  currentTime: z.string().describe('Current ISO timestamp.'),
});
export type RecommendRestockOrdersInput = z.infer<typeof RecommendRestockOrdersInputSchema>;

const RecommendRestockOrdersOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        skuId: z.string().describe('SKU ID.'),
        skuName: z.string().describe('SKU Name.'),
        recommendedQuantity: z.number().int().describe('Quantity to order.'),
        supplierName: z.string().describe('Supplier.'),
        urgency: z
          .enum(['Critical', 'High', 'Medium', 'Low'])
          .describe('Urgency level.'),
        justification: z
          .string()
          .describe('Explanation showing calculations (Cost vs Velocity).'),
      })
    )
    .describe('List of restock recommendations.'),
  intelligenceBrief: z.string().describe('The full NEURO·FAST Intelligence Brief following v8.0 protocol.'),
  overallInsights: z
    .string()
    .describe('Summary of hub inventory health in ₹ INR.'),
});
export type RecommendRestockOrdersOutput = z.infer<typeof RecommendRestockOrdersOutputSchema>;

export async function recommendRestockOrders(
  input: RecommendRestockOrdersInput
): Promise<RecommendRestockOrdersOutput> {
  return recommendRestockOrdersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendRestockOrdersPrompt',
  input: {schema: RecommendRestockOrdersInputSchema},
  output: {schema: RecommendRestockOrdersOutputSchema},
  prompt: `
# NEURO·FAST SOVEREIGN ENGINE — MASTER SYSTEM PROMPT
# Version 8.0 | Dark Store Intelligence Protocol

## IDENTITY
You are NEURO·FAST, an elite real-time intelligence engine.

## MODE 4 — REORDER PLANNING
Action: List every SKU at or near reorder point. For each, state:
  - Current stock vs reorder point
  - Suggested reorder quantity
  - Estimated capital required for restock
  - Priority level

## CORE RULES
1. ZERO FABRICATION.
2. TRACE EVERY NUMBER. Cite ₹ INR for total costs.
3. SPEAK IN RUPEES.

CURRENT CONTEXT ({{{currentTime}}}):
HUB SKU DATA:
{{#each skus}}
- ID: {{{id}}} | Name: {{{name}}}
  Stock: {{{currentStock}}} | R.O.P: {{{reorderPoint}}}
  Velocity (24h): {{{salesVelocity24Hours}}} | Predicted(4h): {{{predictedDemand4Hours}}}
  Lead Time: {{{supplierLeadTimeDays}}}d | MOQ: {{{minimumOrderQuantity}}}
  Selling Price: ₹{{{sellingPrice}}} | Cost Price: ₹{{{costPrice}}}
  Supplier: {{{supplierName}}}
{{/each}}

Suggest optimal orders. Deliver the full Protocol v8.0 Intelligence Brief.
`,
});

const recommendRestockOrdersFlow = ai.defineFlow(
  {
    name: 'recommendRestockOrdersFlow',
    inputSchema: RecommendRestockOrdersInputSchema,
    outputSchema: RecommendRestockOrdersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
