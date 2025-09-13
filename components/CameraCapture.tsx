
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageSource } from '../types';
import { Button } from './ui/Button';
import { Camera } from './ui/Icons';

interface CameraCaptureProps {
  onImageAdd: (image: Omit<ImageSource, 'id'>) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageAdd }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access the camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  }, [facingMode, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        onImageAdd({ type: 'camera', dataUrl, mimeType: 'image/png' });
        // Removed stopCamera() to allow for multiple captures.
      }
    }
  }, [onImageAdd]);
  
  useEffect(() => {
    if (stream) {
      startCamera();
    }
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col items-center gap-4">
      {error && <p className="text-red-400">{error}</p>}
      <div className="w-full max-w-md bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        {!stream && (
           <div className="aspect-video flex items-center justify-center text-gray-500">
               Camera is off
           </div>
        )}
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-auto ${!stream ? 'hidden' : ''}`} />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex gap-4">
        {!stream ? (
          <Button onClick={startCamera}>Start Camera</Button>
        ) : (
          <>
            <Button onClick={capturePhoto}>
              <Camera className="mr-2" />
              Capture Photo
            </Button>
            <Button onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} variant="outline">
              Switch Camera
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Stop Camera
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
