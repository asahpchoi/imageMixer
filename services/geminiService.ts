import { ImageSource } from '../types';

const API_URL = '/api';

export async function mixImages(images: ImageSource[], prompt: string): Promise<string | null> {
  const response = await fetch(`${API_URL}/mix`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ images, prompt }),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate image.');
    } else {
      throw new Error('Failed to generate image. The server returned an unexpected response.');
    }
  }

  const result = await response.json();
  return result.image;
}

export async function optimizePrompt(prompt: string): Promise<string | null> {
  const response = await fetch(`${API_URL}/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to optimize prompt.');
    } else {
      throw new Error('Failed to optimize prompt. The server returned an unexpected response.');
    }
  }

  const result = await response.json();
  return result.prompt;
}
