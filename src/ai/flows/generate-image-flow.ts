'use server';
/**
 * @fileOverview An AI flow to generate images from a text prompt.
 *
 * - generateImage - A function that takes a text prompt and returns an image data URI.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.string().describe('A text prompt describing the image to generate.');
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.string().describe("The generated image as a data URI in 'data:image/png;base64,...' format.");
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(prompt: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(prompt);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (prompt) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    const imageUrl = media.url;
    if (!imageUrl) {
      throw new Error('Image generation failed to produce an image.');
    }

    return imageUrl;
  }
);
