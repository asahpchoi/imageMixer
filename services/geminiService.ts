
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { ImageSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function dataUrlToPart(dataUrl: string, mimeType: string): Part {
  return {
    inlineData: {
      mimeType,
      data: dataUrl.split(',')[1],
    },
  };
}

export async function mixImages(images: ImageSource[], prompt: string): Promise<string | null> {
  const imageParts = images.map(img => dataUrlToPart(img.dataUrl, img.mimeType));
  const textPart: Part = { text: prompt };

  const allParts: Part[] = [...imageParts, textPart];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: allParts,
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
  }

  return null;
}

export async function optimizePrompt(prompt: string): Promise<string | null> {
  const fullPrompt = `You are an expert in writing prompts for generative AI image models. Your task is to take a user's prompt and rewrite it to be more descriptive, detailed, and effective for generating high-quality images. The rewritten prompt should be a single, concise paragraph. Do not add any preamble or explanation, just provide the rewritten prompt.

User prompt: "${prompt}"

Rewritten prompt:`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: {
      parts: [{ text: fullPrompt }],
    },
  });

  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    return response.candidates[0].content.parts[0].text || null;
  }

  return null;
}

export async function generateSimilarPrompts(prompt: string): Promise<string | null> {
  const fullPrompt = `You are an expert in writing prompts for generative AI image models. Your task is to take a user's prompt and generate 3 new prompts with similar ideas, but with different creative directions. The new prompts should be a single, concise paragraph each, and returned as a numbered list.

User prompt: "${prompt}"

New prompts:`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: {
      parts: [{ text: fullPrompt }],
    },
  });

  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    return response.candidates[0].content.parts[0].text || null;
  }

  return null;
}
