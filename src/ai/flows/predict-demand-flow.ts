'use server';
/**
 * @fileOverview NEURO·FAST SOVEREIGN v9.0 APEX — Demand Intelligence Core
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictDemandInputSchema = z.object({
  sku: z.string(),
  skuName: z.string(),
  currentStock: z.number(),
  reorderPoint: z.number(),
  sellingPrice: z.number(),
  costPrice: z.number(),
  historicalSales: z.array(z.object({
    timestamp: z.string(),
    quantity: z.number(),
  })),
});
export type PredictDemandInput = z.infer<typeof PredictDemandInputSchema>;

const PredictDemandOutputSchema = z.object({
  predictedDemandQuantity: z.number(),
  confidenceScore: z.number(),
  intelligenceBrief: z.string().describe("v9.0 APEX formatted deep dive for this specific SKU."),
  reasoning: z.string().describe("Full velocity and days cover calculations."),
});
export type PredictDemandOutput = z.infer<typeof PredictDemandOutputSchema>;

const systemPrompt = `
NEURO·FAST SOVEREIGN v9.0 APEX | Demand Intelligence
LAW: TRACE EVERY NUMBER.
LAW: PRECISION OVER VOLUME.

Apply Engine 2 (Stock Risk Matrix) and Engine 9 (Cash Flow Velocity).
Show velocity = (Total Units / Hours) and Days Cover = (Stock / Velocity).
`;

const prompt = ai.definePrompt({
  name: 'predictDemandPromptV9',
  input: { schema: PredictDemandInputSchema },
  output: { schema: PredictDemandOutputSchema },
  prompt: `
${systemPrompt}

SKU TARGET: {{{skuName}}} (ID: {{{sku}}})
Current Stock: {{{currentStock}}} | ROP: {{{reorderPoint}}}
Financials: Selling ₹{{{sellingPrice}}} | Cost ₹{{{costPrice}}}
Sales Log: {{#each historicalSales}}- {{timestamp}}: {{quantity}} units{{/each}}

Predict demand and provide a SKU Intelligence Brief.
`,
});

export async function predictDemand(input: PredictDemandInput): Promise<PredictDemandOutput> {
  const { output } = await prompt(input);
  return output!;
}
