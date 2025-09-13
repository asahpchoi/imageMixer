
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Upload, Camera, Brush } from './ui/Icons';
import { ImageSource, InputMode } from '../types';
import { ImageUploader } from './ImageUploader';
import { CameraCapture } from './CameraCapture';
import { DrawingCanvas } from './DrawingCanvas';

interface ImageInputTabsProps {
  onImageAdd: (image: Omit<ImageSource, 'id'>) => void;
}

export const ImageInputTabs: React.FC<ImageInputTabsProps> = ({ onImageAdd }) => {
  const [activeTab, setActiveTab] = useState<InputMode>('upload');

  const tabs: { id: InputMode; label: string; icon: React.ElementType }[] = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'draw', label: 'Draw', icon: Brush },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <ImageUploader onImageAdd={onImageAdd} />;
      case 'camera':
        return <CameraCapture onImageAdd={onImageAdd} />;
      case 'draw':
        return <DrawingCanvas onImageAdd={onImageAdd} />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>Step 2: Add Images</CardTitle>
        <div className="border-b border-gray-600 mt-2">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                } group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm focus:outline-none`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};
