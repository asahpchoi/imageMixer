
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ImageSource } from '../types';
import { X, Image } from './ui/Icons';

interface ImagePreviewGridProps {
  images: ImageSource[];
  onRemove: (id: string) => void;
}

const PreviewBox: React.FC<{
  image: ImageSource;
  onRemove: (id: string) => void;
}> = ({ image, onRemove }) => (
  <div className="relative aspect-square bg-dark/50 rounded-lg group overflow-hidden">
    <img src={image.dataUrl} alt={`Source ${image.type}`} className="object-cover w-full h-full" />
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500/80 transition-colors"
          aria-label={`Remove image`}
        >
          <X className="w-4 h-4" />
        </button>
    </div>
  </div>
);


export const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({ images, onRemove }) => {
  return (
    <Card className="bg-light/10 border-light/20 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Your Image Sources ({images.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <PreviewBox key={image.id} image={image} onRemove={onRemove} />
            ))}
          </div>
        ) : (
          <div className="text-center text-light/50 py-8 border-2 border-dashed border-light/20 rounded-lg">
            <Image className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">Add images to get started</p>
            <p className="mt-1 text-sm text-light/40">
              Use the tabs below to upload, capture, or draw.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
