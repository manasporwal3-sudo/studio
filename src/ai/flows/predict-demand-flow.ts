'use server';
/**
 * @fileOverview A Genkit flow for predicting inventory needs.
 *
 * - predictDemand - A function that handles the demand prediction process.
 * - PredictDemandInput - The input type for the predictDemand function.
 * - PredictDemandOutput - The return type for the predictDemand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDemandInputSchema = z.object({
  sku: z.string().describe('The unique identifier of the product (SKU).'),
  currentStock: z.number().int().min(0).describe('The current quantity of the item in stock.'),
  recentSalesData: z
    .array(
      z.object({
        timestamp: z.string().datetime().describe('Timestamp of the sale event.'),
        quantity: z.number().int().min(1).describe('Quantity sold in this event.'),
      })
    )
    .describe('A list of recent sales events for the SKU, including timestamp and quantity. At least 4 hours of data is recommended.'),
  targetPredictionWindowHours: z
    .number()
    .int()
    .min(1)
    .describe('The duration in hours for which to predict inventory needs.'),
});
export type PredictDemandInput = z.infer<typeof PredictDemandInputSchema>;

const PredictDemandOutputSchema = z.object({
  sku: z.string().describe('The SKU for which the prediction was made.'),
  predictedDemandQuantity: z
    .number()
    .int()
    .min(0)
    .describe('The predicted number of units that will be demanded in the target prediction window.'),
  optimalStockLevel: z
    .number()
    .int()
    .min(0)
    .describe('The recommended optimal stock level to have on hand to prevent \'Ghost Stocks\' and meet predicted demand.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('A confidence score (0-1) for the prediction, where 1 is highly confident.'),
  reasoning: z.string().describe('A brief explanation of how the prediction was derived and recommendations.'),
});
export type PredictDemandOutput = z.infer<typeof PredictDemandOutputSchema>;

export async function predictDemand(input: PredictDemandInput): Promise<PredictDemandOutput> {
  return predictDemandFlow(input);
}

const predictDemandPrompt = ai.definePrompt({
  name: 'predictDemandPrompt',
  input: {schema: PredictDemandInputSchema},
  output: {schema: PredictDemandOutputSchema},
  prompt: `You are an expert quick-commerce inventory manager and a highly accurate AI demand forecasting model.
Your goal is to predict inventory needs for a specific product (SKU) over a given time window, based on real-time sales velocity and current stock.
Prevent 'Ghost Stocks' and optimize stock levels to ensure continuous availability.

Here is the data:
SKU: {{{sku}}}
Current Stock: {{{currentStock}}}
Target Prediction Window: {{{targetPredictionWindowHours}}} hours
Recent Sales Data (timestamps in ISO format, quantities sold):
{{#each recentSalesData}}
  - {{timestamp}}: {{quantity}} units
{{/each}}

Based on the provided recent sales data, analyze the sales velocity and trends. Calculate the expected demand for the next {{{targetPredictionWindowHours}}} hours.
Then, recommend an optimal stock level for the SKU to ensure that demand is met within this window, considering the current stock.
Provide a confidence score for your prediction and a brief reasoning for your recommendation.

Remember to provide the output in the exact JSON format specified by the output schema.`,
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
