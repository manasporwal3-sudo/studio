
'use server';
/**
 * @fileOverview A Genkit flow for predicting inventory needs using SOVEREIGN ENGINE v8.0 protocol.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDemandInputSchema = z.object({
  sku: z.string().describe('The unique identifier of the product (SKU).'),
  skuName: z.string().describe('The common name of the SKU.'),
  currentStock: z.number().int().min(0).describe('The current quantity in stock.'),
  reorderPoint: z.number().int().describe('The SKU reorder point.'),
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
  intelligenceBrief: z.string().describe('Sovereign Engine Intelligence Brief specific to this SKU forecast.'),
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
  prompt: `
# NEURO·FAST SOVEREIGN ENGINE — MASTER SYSTEM PROMPT
# Version 8.0 | Dark Store Intelligence Protocol

## IDENTITY
You are NEURO·FAST, an elite real-time intelligence engine for dark stores. 

## CORE RULES
1. ZERO FABRICATION: Only use provided sales data.
2. TRACE EVERY NUMBER: Show the velocity calculation: (Total Sold / Hours) = Velocity.
3. STOCK RISK MATRIX: Apply (Days_Cover = current_stock / daily_velocity).

## SKU FORECAST CONTEXT
SKU: {{{sku}}} ({{{skuName}}})
Current Stock: {{{currentStock}}}
Reorder Point: {{{reorderPoint}}}
Window: {{{targetPredictionWindowHours}}} hours
Sales Log:
{{#each recentSalesData}}
  - {{timestamp}}: {{quantity}} units
{{/each}}

Predict demand. Generate the Intelligence Brief following the exact Protocol v8.0 format.
`,
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
