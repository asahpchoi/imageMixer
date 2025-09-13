
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <Card className="bg-white border-gray-200 w-full max-w-2xl text-black max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Button onClick={onClose} size="sm" variant="ghost">X</Button>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
