
export type InputMode = 'upload' | 'camera' | 'draw' | 'generated';

export interface ImageSource {
  id: string;
  type: InputMode;
  dataUrl: string; // base64 encoded data URL
  mimeType: string;
}
