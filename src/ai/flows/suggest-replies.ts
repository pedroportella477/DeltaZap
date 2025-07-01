'use server';

/**
 * @fileOverview Ferramenta com IA para sugestão de mensagens com base no histórico de bate-papo.
 *
 * - suggestReplies - Uma função que sugere respostas com base no histórico de bate-papo.
 * - SuggestRepliesInput - O tipo de entrada para a função suggestReplies.
 * - SuggestRepliesOutput - O tipo de retorno para a função suggestReplies.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRepliesInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('O histórico completo do bate-papo como uma única string.'),
  currentMessage: z.string().describe('A mensagem mais recente no bate-papo.'),
});
export type SuggestRepliesInput = z.infer<typeof SuggestRepliesInputSchema>;

const SuggestRepliesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Um array de respostas sugeridas com base no histórico do bate-papo.'),
});
export type SuggestRepliesOutput = z.infer<typeof SuggestRepliesOutputSchema>;

export async function suggestReplies(input: SuggestRepliesInput): Promise<SuggestRepliesOutput> {
  return suggestRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepliesPrompt',
  input: {schema: SuggestRepliesInputSchema},
  output: {schema: SuggestRepliesOutputSchema},
  prompt: `Você é um assistente de IA que sugere respostas inteligentes com base no histórico de bate-papo.
  Dado o seguinte histórico de bate-papo e a mensagem atual, forneça três respostas sugeridas que sejam relevantes e contextuais.

  Histórico da Conversa:
  {{chatHistory}}

  Mensagem Atual:
  {{currentMessage}}

  Respostas Sugeridas (em um array de strings):`,
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
