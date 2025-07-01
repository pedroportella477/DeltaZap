'use server';

/**
 * @fileOverview AI-powered tool for message suggestion based on chat history.
 *
 * - suggestReplies - A function that suggests replies based on chat history.
 * - SuggestRepliesInput - The input type for the suggestReplies function.
 * - SuggestRepliesOutput - The return type for the suggestReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRepliesInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The complete chat history as a single string.'),
  currentMessage: z.string().describe('The most recent message in the chat.'),
});
export type SuggestRepliesInput = z.infer<typeof SuggestRepliesInputSchema>;

const SuggestRepliesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested replies based on the chat history.'),
});
export type SuggestRepliesOutput = z.infer<typeof SuggestRepliesOutputSchema>;

export async function suggestReplies(input: SuggestRepliesInput): Promise<SuggestRepliesOutput> {
  return suggestRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepliesPrompt',
  input: {schema: SuggestRepliesInputSchema},
  output: {schema: SuggestRepliesOutputSchema},
  prompt: `You are an AI assistant that suggests smart replies based on the chat history.
  Given the following chat history and the current message, provide three suggested replies that are relevant and contextual.

  Chat History:
  {{chatHistory}}

  Current Message:
  {{currentMessage}}

  Suggested Replies (in an array of strings):`,
});

const suggestRepliesFlow = ai.defineFlow(
  {
    name: 'suggestRepliesFlow',
    inputSchema: SuggestRepliesInputSchema,
    outputSchema: SuggestRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
