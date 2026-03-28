'use server';
/**
 * @fileOverview NEURO·FAST SOVEREIGN v9.0 APEX — Reorder Command
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendRestockOrdersInputSchema = z.object({
  inventory: z.string().describe("Block B Inventory Snapshot."),
  storeProfile: z.string().describe("Block A Store Profile."),
});
export type RecommendRestockOrdersInput = z.infer<typeof RecommendRestockOrdersInputSchema>;

const RecommendRestockOrdersOutputSchema = z.object({
  recommendations: z.array(z.object({
    skuId: z.string(),
    skuName: z.string(),
    recommendedQuantity: z.number(),
    cost: z.number(),
    urgency: z.enum(['Critical', 'High', 'Medium', 'Low']),
    justification: z.string(),
  })),
  intelligenceBrief: z.string().describe("Full v9.0 APEX Reorder Planning Brief."),
  overallInsights: z.string(),
});
export type RecommendRestockOrdersOutput = z.infer<typeof RecommendRestockOrdersOutputSchema>;

const systemPrompt = `
NEURO·FAST SOVEREIGN v9.0 APEX | Reorder Planning
LAW: FINANCIAL IMPACT FIRST.
LAW: NAME THE SKU, QUANTITY, AND ACTION.

Apply Engine 7 (Reorder Intelligence Planner). 
Suggested Qty = (ROP * 2) - Stock. 
Calculate Reorder Capital Required and ROI on reorder capital.
`;

const prompt = ai.definePrompt({
  name: 'recommendRestockOrdersPromptV9',
  input: { schema: RecommendRestockOrdersInputSchema },
  output: { schema: RecommendRestockOrdersOutputSchema },
  prompt: `
${systemPrompt}

STORE CONTEXT: {{{storeProfile}}}
INVENTORY: {{{inventory}}}

Execute MODE 2 (Reorder Command).
`,
});

export async function recommendRestockOrders(input: RecommendRestockOrdersInput): Promise<RecommendRestockOrdersOutput> {
  const { output } = await prompt(input);
  return output!;
}
