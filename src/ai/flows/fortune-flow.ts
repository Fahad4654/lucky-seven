'use server';
/**
 * @fileOverview A flow for generating a fortune.
 *
 * - generateFortune - A function that generates a random fortune and a small prize.
 * - GenerateFortuneOutput - The return type for the generateFortune function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateFortuneOutputSchema = z.object({
  fortune: z.string().describe('A short, witty, or thoughtful fortune cookie-style message.'),
  prize: z.number().describe('A small prize amount, from 5 to 50 credits.'),
});
export type GenerateFortuneOutput = z.infer<typeof GenerateFortuneOutputSchema>;

const fortunePrompt = ai.definePrompt({
  name: 'fortunePrompt',
  output: {schema: GenerateFortuneOutputSchema},
  prompt: `You are a mystical fortune teller inside a casino game. 
Generate a unique, single-sentence fortune. 
It can be funny, wise, or cryptic.
Also, generate a small prize amount between 5 and 50 credits.
`,
});

const generateFortuneFlow = ai.defineFlow(
  {
    name: 'generateFortuneFlow',
    outputSchema: GenerateFortuneOutputSchema,
  },
  async () => {
    const {output} = await fortunePrompt();
    return output!;
  }
);

export async function generateFortune(): Promise<GenerateFortuneOutput> {
  return generateFortuneFlow();
}
