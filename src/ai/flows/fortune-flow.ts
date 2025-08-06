'use server';
/**
 * @fileOverview A flow for generating a fortune.
 *
 * - generateFortune - A function that generates a random fortune and a small prize.
 * - GenerateFortuneOutput - The return type for the generateFortune function.
 */

import {z} from 'zod';

export const GenerateFortuneOutputSchema = z.object({
  fortune: z.string().describe('A short, witty, or thoughtful fortune cookie-style message.'),
  prize: z.number().describe('A small prize amount, from 5 to 50 credits.'),
});
export type GenerateFortuneOutput = z.infer<typeof GenerateFortuneOutputSchema>;

const fortunes = [
    "The early bird gets the worm, but the second mouse gets the cheese.",
    "A journey of a thousand miles begins with a single step.",
    "Your talents will be recognized and suitably rewarded.",
    "You will receive a surprise gift.",
    "A faithful friend is a strong defense.",
    "You will conquer any obstacle to realize your goal.",
    "An exciting opportunity lies ahead of you.",
    "You are a person of culture and taste.",
    "A new perspective will come with the new year.",
    "You will travel to many exotic places in your lifetime."
];

export async function generateFortune(): Promise<GenerateFortuneOutput> {
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  const prize = Math.floor(Math.random() * 46) + 5; // 5 to 50
  
  return {
    fortune,
    prize,
  };
}
