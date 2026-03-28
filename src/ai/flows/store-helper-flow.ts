'use server';
/**
 * @fileOverview storeHelperFlow — The "Grok-style" autonomous node assistant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StoreHelperInputSchema = z.object({
  storeId: z.string(),
  inventory: z.string(),
  riders: z.string(),
  userMessage: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});

const StoreHelperOutputSchema = z.object({
  response: z.string(),
  suggestedAction: z.string().optional(),
});

export async function askStoreHelper(input: z.infer<typeof StoreHelperInputSchema>) {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    system: `You are NEURO·FAST GROK, the autonomous intelligence for Dark Store Node ${input.storeId}.
    
    IDENTITY: Direct, witty, tactical, and uncompromisingly precise.
    DATA ACCESS: You have full visibility of the inventory mesh and rider telemetry provided below.
    
    INVENTORY MESH: ${input.inventory}
    FLEET STATUS: ${input.riders}
    
    INSTRUCTIONS:
    1. Answer as if you are the OS of this specific dark store.
    2. If stock is low, call it out. 
    3. If riders are idle, suggest task reallocation.
    4. Maintain a high-contrast, cyberpunk personality.`,
    prompt: input.userMessage,
    output: { schema: StoreHelperOutputSchema },
  });

  return output!;
}