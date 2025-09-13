
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI, Modality, Part } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/mix', async (req, res) => {
  const { images, prompt } = req.body;

  try {
    const imageParts = images.map((img: { dataUrl: string; mimeType: string; }) => dataUrlToPart(img.dataUrl, img.mimeType));
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
          res.json({ image: part.inlineData.data });
          return;
        }
      }
    }

    res.status(500).json({ error: 'Failed to generate image.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unknown error occurred.' });
  }
});

app.post('/optimize', async (req, res) => {
  const { prompt } = req.body;

  try {
    const fullPrompt = `You are an expert in writing prompts for generative AI image models. Your task is to take a user's prompt and rewrite it to be more descriptive, detailed, and effective for generating high-quality images. The rewritten prompt should be a single, concise paragraph. Always mentions about based on the provided images, Do not add any preamble or explanation, just provide the rewritten prompt.\n\nUser prompt: "${prompt}"\n\nRewritten prompt:`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [{ text: fullPrompt }],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const optimizedPrompt = response.candidates[0].content.parts[0].text || '';
      const finalPrompt = `${optimizedPrompt}`;
      res.json({ prompt: finalPrompt });
      return;
    }

    res.status(500).json({ error: 'Failed to generate prompt.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unknown error occurred.' });
  }
});

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const fullPrompt = `You are an expert in writing prompts for generative AI image models. Your task is to take a user's prompt and generate 3 new prompts with similar ideas, but with different creative directions. The new prompts should be a single, concise paragraph each, and returned as a numbered list.\n\nUser prompt: "${prompt}"\n\nNew prompts:`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [{ text: fullPrompt }],
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      res.json({ prompts: response.candidates[0].content.parts[0].text || null });
      return;
    }

    res.status(500).json({ error: 'Failed to generate prompts.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unknown error occurred.' });
  }
});

function dataUrlToPart(dataUrl: string, mimeType: string): Part {
  return {
    inlineData: {
      mimeType,
      data: dataUrl.split(',')[1],
    },
  };
}

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
