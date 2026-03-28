'use server';
/**
 * @fileOverview An AI-powered assistant that suggests optimal restocking orders.
 *
 * - recommendRestockOrders - A function that handles the restock order recommendation process.
 * - RecommendRestockOrdersInput - The input type for the recommendRestockOrders function.
 * - RecommendRestockOrdersOutput - The return type for the recommendRestockOrders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendRestockOrdersInputSchema = z.object({
  skus: z
    .array(
      z.object({
        id: z.string().describe('Unique identifier for the SKU.'),
        name: z.string().describe('Name of the SKU.'),
        currentStock: z.number().int().describe('Current stock level of the SKU.'),
        predictedDemand4Hours: z
          .number()
          .int()
          .describe('Predicted demand for the SKU over the next 4 hours.'),
        salesVelocity24Hours: z
          .number()
          .int()
          .describe('Sales velocity of the SKU over the last 24 hours.'),
        supplierLeadTimeDays: z
          .number()
          .int()
          .describe('Lead time from the supplier in days.'),
        minimumOrderQuantity: z
          .number()
          .int()
          .describe('Minimum order quantity for this SKU from the supplier.'),
        unitPrice: z.number().describe('Unit price of the SKU.'),
        supplierName: z.string().describe('Name of the primary supplier for this SKU.'),
      })
    )
    .describe('Array of SKU data for which to recommend restocking orders.'),
  currentTime: z.string().describe('Current timestamp for context (e.g., ISO string).'),
});
export type RecommendRestockOrdersInput = z.infer<typeof RecommendRestockOrdersInputSchema>;

const RecommendRestockOrdersOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        skuId: z.string().describe('Unique identifier for the SKU.'),
        skuName: z.string().describe('Name of the SKU.'),
        recommendedQuantity: z.number().int().describe('Recommended quantity to order.'),
        supplierName: z.string().describe('Supplier for the recommended order.'),
        urgency: z
          .enum(['Critical', 'High', 'Medium', 'Low'])
          .describe('Urgency level of the restock order.'),
        justification: z
          .string()
          .describe('Explanation for the recommended order and its urgency.'),
      })
    )
    .describe('List of recommended restocking orders.'),
  overallInsights: z
    .string()
    .describe(
      'Overall insights and summary of inventory health and suggested procurement strategy.'
    ),
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
  prompt: `You are an expert AI-powered procurement assistant for a quick-commerce business.
Your primary goal is to analyze current inventory, predicted demand, sales velocity, and supplier information to suggest optimal restocking orders for the next 4 hours.
You must prioritize maintaining zero-latency inventory, preventing 'Ghost Stocks', and ensuring product availability for quick delivery.
Provide clear, actionable recommendations and detailed justifications. Factor in supplier lead times and minimum order quantities to ensure realistic and effective orders.
Categorize the urgency of each restock recommendation as 'Critical', 'High', 'Medium', or 'Low' based on the potential for stockouts and impact on sales.
Finally, provide an overall summary of the inventory health and suggest a procurement strategy.

Current time: {{{currentTime}}}

Here is the current SKU data:
{{#each skus}}
- SKU ID: {{{id}}}
  Name: {{{name}}}
  Current Stock: {{{currentStock}}}
  Predicted Demand (next 4 hours): {{{predictedDemand4Hours}}}
  Sales Velocity (last 24 hours): {{{salesVelocity24Hours}}}
  Supplier Lead Time (days): {{{supplierLeadTimeDays}}}
  Minimum Order Quantity: {{{minimumOrderQuantity}}}
  Unit Price: {{{unitPrice}}}
  Supplier Name: {{{supplierName}}}
{{/each}}

Based on this data, generate a list of restocking recommendations and overall insights:
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
