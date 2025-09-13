import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageInputTabs } from './components/ImageInputTabs';
import { ImagePreviewGrid } from './components/ImagePreviewGrid';
import { Button } from './components/ui/Button';
import { Textarea } from './components/ui/Textarea';
import { Label } from './components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { ImageSource } from './types';
import { mixImages, optimizePrompt } from './services/geminiService';
import { LoaderCircle } from './components/ui/Icons';
import { Modal } from './components/ui/Modal';

const FullscreenPromptEditor: React.FC<{
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onClose: () => void;
}> = ({ prompt, onPromptChange, onClose }) => {
  const [editedPrompt, setEditedPrompt] = useState(prompt);

  const handleDone = () => {
    onPromptChange(editedPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col p-4 z-50">
      <div className="flex-grow flex flex-col">
        <Textarea
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          className="w-full h-full bg-dark border-2 border-light/20 rounded-lg text-light text-xl"
          placeholder="Enter your prompt here..."
        />
      </div>
      <div className="flex justify-end gap-4 p-4">
        <Button onClick={handleDone} size="lg" className="bg-primary hover:bg-primary/80 text-dark font-bold rounded-full shadow-md">
          Done
        </Button>
      </div>
    </div>
  );
};

const OptimizedPromptModalContent: React.FC<{prompt: string, onUse: (prompt: string) => void}> = ({prompt, onUse}) => {
    const [editedPrompt, setEditedPrompt] = useState(prompt);

    return (
        <div className="flex flex-col gap-4">
            <Textarea value={editedPrompt} onChange={(e) => setEditedPrompt(e.target.value)} className="bg-dark border-2 border-light/20 rounded-lg text-light" />
            <Button onClick={() => onUse(editedPrompt)} size="sm" className="bg-secondary hover:bg-secondary/80 text-dark font-bold rounded-full shadow-md">
                Use This Prompt
            </Button>
        </div>
    )
}

const App: React.FC = () => {
  const [images, setImages] = useState<ImageSource[]>([]);
  const [prompt, setPrompt] = useState<string>('Create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAl-style toy packaging box printed with the original artwork');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [mixedImage, setMixedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  

  useEffect(() => {
    try {
      const storedImages = localStorage.getItem('generatedImages');
      if (storedImages) {
        setImages(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error("Failed to load images from local storage", error);
    }
  }, []);

  const addImage = useCallback((newImage: Omit<ImageSource, 'id'>) => {
    const imageWithId: ImageSource = {
        ...newImage,
        id: `${Date.now()}-${Math.random()}`
    };
    setImages(prevImages => {
        const updatedImages = [...prevImages, imageWithId];
        try {
          localStorage.setItem('generatedImages', JSON.stringify(updatedImages));
        } catch (error) {
          console.error("Failed to save images to local storage", error);
        }
        return updatedImages;
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prevImages => {
        const updatedImages = prevImages.filter(img => img.id !== id);
        try {
          localStorage.setItem('generatedImages', JSON.stringify(updatedImages));
        } catch (error) {
          console.error("Failed to save images to local storage", error);
        }
        return updatedImages;
    });
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
        const newImageSrc = `data:image/png;base64,${result}`;
        setMixedImage(newImageSrc);
        addImage({
          type: 'generated',
          dataUrl: newImageSrc,
          mimeType: 'image/png'
        });
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

  const handleOptimizePrompt = async () => {
    if (!prompt) return;
    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(prompt);
      if (result) {
        setModalContent({
          title: 'Optimized Prompt',
          content: <OptimizedPromptModalContent prompt={result} onUse={(p) => { setPrompt(p); setIsModalOpen(false); }} />
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
    <div className="min-h-screen bg-dark text-light font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-2 sm:p-4 flex flex-col gap-4 md:gap-6">
        <ImageInputTabs onImageAdd={addImage} />

        <ImagePreviewGrid images={images} onRemove={removeImage} />

        <Card className="bg-dark/50 border-primary/30 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Describe the Mix</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <Label htmlFor="prompt" className="mb-2 sm:mb-0">Mixing Instruction</Label>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button onClick={handleOptimizePrompt} disabled={!prompt || isOptimizing} size="sm" variant="outline" className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-dark rounded-full shadow-md">
                  {isOptimizing && <LoaderCircle className="animate-spin mr-2" />}
                  {isOptimizing ? 'Optimizing...' : 'Optimize'}
                </Button>
                
                <Button onClick={() => setPrompt('')} disabled={!prompt} size="sm" variant="outline" className="bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-dark rounded-full shadow-md">
                  Clear
                </Button>
              </div>
            </div>
            <div
              onClick={() => setIsPromptEditorOpen(true)}
              className="bg-dark border-2 border-light/20 rounded-lg text-light p-4 cursor-pointer min-h-[100px] overflow-y-auto active:bg-light/10 transition-colors"
            >
              {prompt || "e.g., 'Combine the uploaded photo and the drawing. The person in the photo should be holding the drawn object. Make it look like a vintage painting.'"}
            </div>
            <Button onClick={handleMixImages} disabled={!canMix} size="lg" className="bg-primary hover:bg-primary/80 text-dark font-bold rounded-full shadow-lg text-lg">
              {isLoading && <LoaderCircle className="animate-spin mr-2" />}
              {isLoading ? 'Mixing...' : 'Mix Images'}
            </Button>
          </CardContent>
        </Card>

        {error && <p className="text-red-400 text-center py-2">{error}</p>}

        {mixedImage && (
          <Card className="bg-dark/50 border-primary/30 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row justify-between items-center">
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
      {isPromptEditorOpen && (
        <FullscreenPromptEditor
          prompt={prompt}
          onPromptChange={setPrompt}
          onClose={() => setIsPromptEditorOpen(false)}
        />
      )}
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
