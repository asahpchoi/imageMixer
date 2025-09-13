import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ImageSource } from '../types';
import { Button } from './ui/Button';
import { X } from './ui/Icons';

interface DrawingCanvasProps {
  onImageAdd: (image: Omit<ImageSource, 'id'>) => void;
}

const LOCAL_STORAGE_KEY = 'gemini-image-mixer-drawings';

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onImageAdd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedDrawings = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedDrawings) {
        setSavedDrawings(JSON.parse(storedDrawings));
      }
    } catch (error) {
      console.error("Failed to load drawings from localStorage", error);
    }
  }, []);

  // Persist to localStorage whenever savedDrawings changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedDrawings));
    } catch (error) {
      console.error("Failed to save drawings to localStorage", error);
    }
  }, [savedDrawings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 5;
        setCtx(context);
      }
    }
  }, []);

  const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = 'touches' in event ? event.touches[0] : null;
    return { 
      x: (touch ? touch.clientX : (event as React.MouseEvent).clientX) - rect.left, 
      y: (touch ? touch.clientY : (event as React.MouseEvent).clientY) - rect.top 
    };
  };

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (ctx) {
      const { x, y } = getCoords(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  }, [ctx]);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing || !ctx) return;
    const { x, y } = getCoords(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawing(true);
  }, [isDrawing, ctx]);

  const stopDrawing = useCallback(() => {
    if (ctx) {
      ctx.closePath();
      setIsDrawing(false);
    }
  }, [ctx]);
  
  const clearCanvas = useCallback(() => {
    if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHasDrawing(false);
    }
  }, [ctx]);

  const addDrawingToMix = useCallback(() => {
    if (canvasRef.current && hasDrawing) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onImageAdd({ type: 'draw', dataUrl, mimeType: 'image/png' });
      clearCanvas();
    }
  }, [onImageAdd, clearCanvas, hasDrawing]);

  const saveDrawingToLocal = useCallback(() => {
    if (canvasRef.current && hasDrawing) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setSavedDrawings(prev => [dataUrl, ...prev]);
    }
  }, [hasDrawing]);

  const loadDrawing = useCallback((dataUrl: string) => {
    if (ctx && canvasRef.current) {
      clearCanvas();
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
        setHasDrawing(true);
      };
      img.src = dataUrl;
    }
  }, [ctx, clearCanvas]);

  const deleteDrawing = useCallback((indexToDelete: number) => {
    setSavedDrawings(prev => prev.filter((_, index) => index !== indexToDelete));
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <canvas
        ref={canvasRef}
        width="350"
        height="250"
        className="bg-gray-700 rounded-lg border border-gray-600 touch-none w-full max-w-md aspect-[7/5]"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
       <div className="flex flex-wrap justify-center gap-2">
         <Button onClick={addDrawingToMix} disabled={!hasDrawing}>Add Drawing to Mix</Button>
         <Button onClick={saveDrawingToLocal} disabled={!hasDrawing} variant="outline">Save for Later</Button>
         <Button onClick={clearCanvas} variant="outline" disabled={!hasDrawing}>Clear</Button>
      </div>
      <div className="w-full mt-4">
        <h4 className="text-md font-semibold mb-2 text-gray-300 text-center">Saved Drawings</h4>
        {savedDrawings.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto p-2 bg-gray-900/50 rounded-lg border border-gray-700 min-h-[80px]">
            {savedDrawings.map((drawingUrl, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <img
                  src={drawingUrl}
                  alt={`Saved drawing ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md border-2 border-gray-600 group-hover:border-cyan-400 cursor-pointer"
                  onClick={() => loadDrawing(drawingUrl)}
                  aria-label={`Load drawing ${index + 1}`}
                />
                <button
                  onClick={() => deleteDrawing(index)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Delete drawing ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No saved drawings yet. Use "Save for Later" to keep them here.</p>
        )}
      </div>
    </div>
  );
};