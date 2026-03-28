'use server';
/**
 * @fileOverview A Genkit flow for predicting inventory needs using SOVEREIGN ENGINE v8.0 protocol.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDemandInputSchema = z.object({
  sku: z.string().describe('The unique identifier of the product (SKU).'),
  currentStock: z.number().int().min(0).describe('The current quantity in stock.'),
  recentSalesData: z
    .array(
      z.object({
        timestamp: z.string().datetime().describe('Timestamp of the sale event.'),
        quantity: z.number().int().min(1).describe('Quantity sold.'),
      })
    )
    .describe('List of recent sales events.'),
  targetPredictionWindowHours: z
    .number()
    .int()
    .min(1)
    .describe('Duration in hours for prediction.'),
});
export type PredictDemandInput = z.infer<typeof PredictDemandInputSchema>;

const PredictDemandOutputSchema = z.object({
  sku: z.string().describe('The SKU for prediction.'),
  predictedDemandQuantity: z
    .number()
    .int()
    .min(0)
    .describe('Predicted units demanded.'),
  optimalStockLevel: z
    .number()
    .int()
    .min(0)
    .describe('Recommended optimal stock level.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score (0-1).'),
  reasoning: z.string().describe('Explanation tracing numbers back to raw sales velocity.'),
});
export type PredictDemandOutput = z.infer<typeof PredictDemandOutputSchema>;

export async function predictDemand(input: PredictDemandInput): Promise<PredictDemandOutput> {
  return predictDemandFlow(input);
}

const predictDemandPrompt = ai.definePrompt({
  name: 'predictDemandPrompt',
  input: {schema: PredictDemandInputSchema},
  output: {schema: PredictDemandOutputSchema},
  prompt: `You are NEURO·FAST SOVEREIGN ENGINE v8.0. You are an elite demand forecasting model.

CORE OPERATING RULES:
1. ZERO FABRICATION: Only use provided sales data.
2. TRACE EVERY NUMBER: Show the velocity calculation. Example: (Total Sold / Hours) = Velocity.
3. PRIORITIZE BY IMPACT: Highlight if this SKU represents a major stockout risk.
4. RUPEES AND UNITS: Use units and ₹ INR where applicable.

SKU DATA:
SKU: {{{sku}}}
Current Stock: {{{currentStock}}}
Window: {{{targetPredictionWindowHours}}} hours
Sales Log:
{{#each recentSalesData}}
  - {{timestamp}}: {{quantity}} units
{{/each}}

Predict demand and optimal stock. If history is insufficient, state: "I need more historical data to provide a high-confidence forecast."`,
});

const predictDemandFlow = ai.defineFlow(
  {
    name: 'predictDemandFlow',
    inputSchema: PredictDemandInputSchema,
    outputSchema: PredictDemandOutputSchema,
  },
  async input => {
    const {output} = await predictDemandPrompt(input);
    return output!;
  }
);
