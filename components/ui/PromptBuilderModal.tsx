import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Textarea } from './Textarea';
import { Label } from './Label';

interface PromptBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptCreate: (prompt: string) => void;
}

export const PromptBuilderModal: React.FC<PromptBuilderModalProps> = ({ isOpen, onClose, onPromptCreate }) => {
  const [scale, setScale] = useState('1/7');
  const [subject, setSubject] = useState('commercialized figure of the character in the illustration');
  const [style, setStyle] = useState('realistic');
  const [environment, setEnvironment] = useState('on a computer desk');
  const [base, setBase] = useState('using a circular transparent acrylic base without any text');
  const [details, setDetails] = useState('On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAl-style toy packaging box printed with the original artwork');

  const generatePrompt = () => {
    const prompt = `Create a ${scale} scale ${subject}, in a ${style} style and environment. Place the figure ${environment}, ${base}. ${details}`;
    onPromptCreate(prompt);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Prompt Builder">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader><CardTitle>Subject</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label>Scale</Label>
            <input type="text" value={scale} onChange={(e) => setScale(e.target.value)} className="bg-dark border-2 border-light/20 rounded-lg text-light p-2" />
            <Label>Subject Description</Label>
            <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-dark border-2 border-light/20 rounded-lg text-light" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Style</CardTitle></CardHeader>
          <CardContent>
            <input type="text" value={style} onChange={(e) => setStyle(e.target.value)} className="bg-dark border-2 border-light/20 rounded-lg text-light p-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Environment</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label>Placement</Label>
            <input type="text" value={environment} onChange={(e) => setEnvironment(e.target.value)} className="bg-dark border-2 border-light/20 rounded-lg text-light p-2" />
            <Label>Base</Label>
            <input type="text" value={base} onChange={(e) => setBase(e.target.value)} className="bg-dark border-2 border-light/20 rounded-lg text-light p-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} className="bg-dark border-2 border-light/20 rounded-lg text-light" />
          </CardContent>
        </Card>
        <Button onClick={generatePrompt}>Generate and Use Prompt</Button>
      </div>
    </Modal>
  );
};