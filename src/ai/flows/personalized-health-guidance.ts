'use server';

/**
 * @fileOverview A flow to provide personalized health guidance based on user symptoms and medical history.
 *
 * - personalizedHealthGuidance - A function that takes user symptoms and medical history and returns tailored health advice.
 * - PersonalizedHealthGuidanceInput - The input type for the personalizedHealthGuidance function.
 * - PersonalizedHealthGuidanceOutput - The return type for the personalizedHealthGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHealthGuidanceInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the patient symptoms.'),
  medicalHistory: z.string().describe('The medical history of the patient.'),
});
export type PersonalizedHealthGuidanceInput = z.infer<typeof PersonalizedHealthGuidanceInputSchema>;

const PersonalizedHealthGuidanceOutputSchema = z.object({
  advice: z.string().describe('Tailored health advice based on the provided information.'),
});
export type PersonalizedHealthGuidanceOutput = z.infer<typeof PersonalizedHealthGuidanceOutputSchema>;

export async function personalizedHealthGuidance(input: PersonalizedHealthGuidanceInput): Promise<PersonalizedHealthGuidanceOutput> {
  return personalizedHealthGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHealthGuidancePrompt',
  input: {schema: PersonalizedHealthGuidanceInputSchema},
  output: {schema: PersonalizedHealthGuidanceOutputSchema},
  prompt: `You are a healthcare assistant bot designed to provide personalized health guidance based on the user's symptoms and medical history.

  Symptoms: {{{symptoms}}}
  Medical History: {{{medicalHistory}}}

  Based on the provided information, what tailored health advice can you provide?`,
});

const personalizedHealthGuidanceFlow = ai.defineFlow(
  {
    name: 'personalizedHealthGuidanceFlow',
    inputSchema: PersonalizedHealthGuidanceInputSchema,
    outputSchema: PersonalizedHealthGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
