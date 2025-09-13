
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageInputTabs } from './components/ImageInputTabs';
import { ImagePreviewGrid } from './components/ImagePreviewGrid';
import { Button } from './components/ui/Button';
import { Textarea } from './components/ui/Textarea';
import { Label } from './components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { ImageSource } from './types';
import { mixImages } from './services/geminiService';
import { LoaderCircle } from './components/ui/Icons';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageSource[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [mixedImage, setMixedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addImage = useCallback((newImage: Omit<ImageSource, 'id'>) => {
    const imageWithId: ImageSource = {
        ...newImage,
        id: `${Date.now()}-${Math.random()}`
    };
    setImages(prevImages => [...prevImages, imageWithId]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prevImages => prevImages.filter(img => img.id !== id));
  }, []);

  const handleMixImages = async () => {
    if (images.length < 1 || !prompt) {
      setError("Please add at least one image and a prompt.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setMixedImage(null);

    try {
      const result = await mixImages(images, prompt);
      if (result) {
        setMixedImage(`data:image/png;base64,${result}`);
      } else {
        setError("Failed to generate image. The model might not have returned an image.");
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const canMix = images.length > 0 && prompt.trim().length > 0 && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col gap-6">
        <ImagePreviewGrid images={images} onRemove={removeImage} />

        <ImageInputTabs onImageAdd={addImage} />

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Step 3: Describe the Mix</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Label htmlFor="prompt">Mixing Instruction</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Combine the uploaded photo and the drawing. The person in the photo should be holding the drawn object. Make it look like a vintage painting.'"
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            />
            <Button onClick={handleMixImages} disabled={!canMix}>
              {isLoading && <LoaderCircle className="animate-spin mr-2" />}
              {isLoading ? 'Mixing...' : 'Mix Images'}
            </Button>
          </CardContent>
        </Card>

        {error && <p className="text-red-400 text-center">{error}</p>}

        {mixedImage && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Your Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={mixedImage} alt="Mixed result" className="rounded-lg w-full" />
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
