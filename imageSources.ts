
import { Upload, Camera, Brush } from './components/ui/Icons';
import { InputMode } from './types';

export const imageSources: { id: InputMode; label: string; icon: React.ElementType }[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'draw', label: 'Draw', icon: Brush },
];
