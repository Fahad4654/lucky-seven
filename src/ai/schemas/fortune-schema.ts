import {z} from 'zod';

export const GenerateFortuneOutputSchema = z.object({
  fortune: z.string().describe('A short, witty, or thoughtful fortune cookie-style message.'),
  prize: z.number().describe('A small prize amount, from 5 to 50 credits.'),
});
export type GenerateFortuneOutput = z.infer<typeof GenerateFortuneOutputSchema>;
