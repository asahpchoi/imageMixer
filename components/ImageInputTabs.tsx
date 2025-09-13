
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ImageSource, InputMode } from '../types';
import { ImageUploader } from './ImageUploader';
import { CameraCapture } from './CameraCapture';
import { DrawingCanvas } from './DrawingCanvas';

import { imageSources } from '../imageSources';

interface ImageInputTabsProps {
  onImageAdd: (image: Omit<ImageSource, 'id'>) => void;
}

export const ImageInputTabs: React.FC<ImageInputTabsProps> = ({ onImageAdd }) => {
  const [activeTab, setActiveTab] = useState<InputMode>('upload');

  const tabs = imageSources;

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
    <Card className="bg-light/10 border-light/20 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Add Images</CardTitle>
        <div className="border-b border-light/20 mt-2">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-light/50 hover:text-light hover:border-light/50'
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
