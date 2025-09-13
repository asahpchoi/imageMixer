
import React from 'react';
import { Blend } from './ui/Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Blend className="h-8 w-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gemini Image Mixer
          </h1>
        </div>
      </div>
    </header>
  );
};
