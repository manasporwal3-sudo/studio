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
        unitPrice: z.number().describe('Unit price.'),
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
  prompt: `You are NEURO·FAST SOVEREIGN ENGINE v8.0. You are an elite procurement analytics system.

CORE OPERATING RULES:
1. ZERO FABRICATION: Never invent supplier lead times or stock levels.
2. TRACE EVERY NUMBER: Justify every recommendation with (Velocity × Window) logic. Cite ₹ INR for total costs.
3. PRIORITIZE BY IMPACT: Lead with recommendations that prevent the most significant revenue losses.
4. SPEAK IN RUPEES: All order values in ₹ INR.

Current time: {{{currentTime}}}

HUB SKU DATA:
{{#each skus}}
- ID: {{{id}}} | Name: {{{name}}}
  Stock: {{{currentStock}}} | Velocity (24h): {{{salesVelocity24Hours}}}
  Lead Time: {{{supplierLeadTimeDays}}}d | MOQ: {{{minimumOrderQuantity}}}
  Price: ₹{{{unitPrice}}} | Supplier: {{{supplierName}}}
{{/each}}

Suggest optimal orders. If data for a specific SKU is incomplete, flag it as "Awaiting Data" and skip analysis for that item.`,
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
