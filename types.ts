
export type InputMode = 'upload' | 'camera' | 'draw';

export interface ImageSource {
  id: string;
  type: InputMode;
  dataUrl: string; // base64 encoded data URL
  mimeType: string;
}
