
import React, { useState, useCallback } from 'react';
import { ImageSource } from '../types';
import { fileToDataUrl } from '../utils';

interface ImageUploaderProps {
  onImageAdd: (image: Omit<ImageSource, 'id'>) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageAdd }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFeedback(`Processing ${files.length} image(s)...`);
      let addedCount = 0;
      const promises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          return;
        }
        try {
          const dataUrl = await fileToDataUrl(file);
          onImageAdd({
            type: 'upload',
            dataUrl,
            mimeType: file.type,
          });
          addedCount++;
        } catch (error) {
          console.error(`Failed to read file: ${file.name}`, error);
        }
      });
      await Promise.all(promises);
      setFeedback(`${addedCount} image(s) added successfully.`);

      // Clear the input value to allow re-uploading the same file(s)
      event.target.value = '';
    }
  }, [onImageAdd]);

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
      >
        Select Image(s)
      </label>
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={handleFileChange}
        multiple
      />
      <p className="mt-2 text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
      {feedback && <p className="mt-2 text-sm text-cyan-400">{feedback}</p>}
    </div>
  );
};
