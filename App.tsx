import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageInputTabs } from './components/ImageInputTabs';
import { ImagePreviewGrid } from './components/ImagePreviewGrid';
import { Button } from './components/ui/Button';
import { Textarea } from './components/ui/Textarea';
import { Label } from './components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { ImageSource } from './types';
import { mixImages, optimizePrompt, generateSimilarPrompts } from './services/geminiService';
import { LoaderCircle } from './components/ui/Icons';
import { Modal } from './components/ui/Modal';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageSource[]>([]);
  const [prompt, setPrompt] = useState<string>('Create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAl-style toy packaging box printed with the original artwork');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [mixedImage, setMixedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

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

  const handleGenerateSimilarPrompts = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const result = await generateSimilarPrompts(prompt);
      if (result) {
        const prompts = result.split(/\n\d+\. /).filter(p => p.trim() !== '');
        setModalContent({
          title: 'Similar Ideas',
          content: (
            <div className="flex flex-col gap-4">
              {prompts.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-dark/50 p-2 rounded-lg">
                  <p className="text-light text-sm">{p}</p>
                  <Button onClick={() => { setPrompt(p); setIsModalOpen(false); }} size="sm" className="bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-full shadow-md">Use</Button>
                </div>
              ))}
            </div>
          )
        });
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred while generating prompts.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!prompt) return;
    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(prompt);
      if (result) {
        setModalContent({
          title: 'Optimized Prompt',
          content: (
            <div className="flex flex-col gap-4">
              <p className="text-light">{result}</p>
              <Button onClick={() => { setPrompt(result); setIsModalOpen(false); }} size="sm" className="bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-full shadow-md">
                Use This Prompt
              </Button>
            </div>
          )
        });
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred while optimizing the prompt.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleShare = async () => {
    if (!mixedImage) return;

    try {
      const response = await fetch(mixedImage);
      const blob = await response.blob();
      const file = new File([blob], 'mixed-image.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Image Mixer Creation',
          text: 'Check out this image I created with Image Mixer!',
        });
      } else {
        alert('Web Share API is not supported in your browser or cannot share these files.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('An error occurred while trying to share the image.');
    }
  };

  const canMix = images.length > 0 && prompt.trim().length > 0 && !isLoading;

  return (
    <div className="min-h-screen bg-dark text-light font-sans flex flex-col" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col gap-6">
        <ImageInputTabs onImageAdd={addImage} />

        <ImagePreviewGrid images={images} onRemove={removeImage} />

        <Card className="bg-dark border-2 border-primary/50 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Describe the Mix</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">Mixing Instruction</Label>
              <Button onClick={handleOptimizePrompt} disabled={!prompt || isOptimizing} size="sm" variant="outline" className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-dark rounded-full shadow-md">
                {isOptimizing && <LoaderCircle className="animate-spin mr-2" />}
                {isOptimizing ? 'Optimizing...' : 'Optimize Prompt'}
              </Button>
              <Button onClick={handleGenerateSimilarPrompts} disabled={!prompt || isGenerating} size="sm" variant="outline" className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-dark rounded-full shadow-md">
                {isGenerating && <LoaderCircle className="animate-spin mr-2" />}
                {isGenerating ? 'Generating...' : 'Generate Ideas'}
              </Button>
            </div>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Combine the uploaded photo and the drawing. The person in the photo should be holding the drawn object. Make it look like a vintage painting.'"
              className="bg-dark border-2 border-light/20 rounded-lg text-light"
            />
            <Button onClick={handleMixImages} disabled={!canMix} className="bg-primary hover:bg-primary/80 text-dark font-bold rounded-full shadow-md">
              {isLoading && <LoaderCircle className="animate-spin mr-2" />}
              {isLoading ? 'Mixing...' : 'Mix Images'}
            </Button>
          </CardContent>
        </Card>

        {error && <p className="text-red-400 text-center">{error}</p>}

        {mixedImage && (
          <Card className="bg-dark border-2 border-primary/50 shadow-lg rounded-2xl">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Your Creation</CardTitle>
              <Button onClick={handleShare} size="sm" variant="outline" className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-dark rounded-full shadow-md">Share</Button>
            </CardHeader>
            <CardContent>
              <img src={mixedImage} alt="Mixed result" className="rounded-lg w-full" />
            </CardContent>
          </Card>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalContent?.title || ''}>
          {modalContent?.content}
        </Modal>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
