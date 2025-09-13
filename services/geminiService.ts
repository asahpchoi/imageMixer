
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
