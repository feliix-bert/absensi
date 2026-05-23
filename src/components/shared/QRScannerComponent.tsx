'use client';

import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, Exception } from '@zxing/library';

interface QRScannerComponentProps {
  onScanSuccess: (text: string) => void;
  onScanError?: (error: string) => void;
  torchOn?: boolean;
}

export function QRScannerComponent({ onScanSuccess, onScanError, torchOn }: QRScannerComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    
    codeReader.current = new BrowserMultiFormatReader();
    
    codeReader.current.decodeFromConstraints(
      { 
        video: { 
          facingMode: 'environment',
        } 
      }, 
      videoRef.current, 
      (result, error) => {
        if (result) {
          onScanSuccess(result.getText());
        }
        if (error && !(error instanceof Exception)) {
          // Exception is thrown constantly while scanning and not finding a code,
          // only report actual errors
          const err = error as Error;
          if (onScanError) onScanError(err.message || 'Error occurred');
        }
      }
    ).catch(err => {
      console.error(err);
      if (onScanError) onScanError(err.message || 'Kamera tidak dapat diakses');
    });

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScanSuccess, onScanError]);

  // Handle Torch
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities();
        if ((capabilities as any).torch) {
          track.applyConstraints({
            advanced: [{ torch: torchOn }] as any
          }).catch(console.error);
        }
      }
    }
  }, [torchOn]);

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted
        playsInline
      />
    </div>
  );
}
