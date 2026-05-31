'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Exception } from '@zxing/library';

interface QRScannerComponentProps {
  onScanSuccess: (text: string) => void;
  onScanError?: (error: string) => void;
  torchOn?: boolean;
  onTorchSupportChange?: (supported: boolean) => void;
}

export function QRScannerComponent({ onScanSuccess, onScanError, torchOn, onTorchSupportChange }: QRScannerComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);

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
          const err = error as Error;
          if (onScanError) onScanError(err.message || 'Error occurred');
        }
      }
    ).then(() => {
       setTimeout(() => {
         if (videoRef.current && videoRef.current.srcObject) {
           const stream = videoRef.current.srcObject as MediaStream;
           const track = stream.getVideoTracks()[0];
           if (track && track.getCapabilities) {
             try {
               const capabilities = track.getCapabilities();
               const hasTorch = !!(capabilities as any).torch;
               setTorchSupported(hasTorch);
               if (onTorchSupportChange) onTorchSupportChange(hasTorch);
             } catch (e) {
               console.error("Torch capability check failed", e);
               setTorchSupported(false);
               if (onTorchSupportChange) onTorchSupportChange(false);
             }
           } else {
               setTorchSupported(false);
               if (onTorchSupportChange) onTorchSupportChange(false);
           }
         }
       }, 500);
    }).catch(err => {
      console.error(err);
      if (onScanError) onScanError(err.message || 'Camera cannot be accessed');
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
  }, [onScanSuccess, onScanError, onTorchSupportChange]);

  // Handle Torch
  useEffect(() => {
    if (torchSupported && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === 'function') {
        try {
          track.applyConstraints({
            advanced: [{ torch: torchOn }] as any
          }).catch(e => console.warn('Could not apply torch constraint:', e));
        } catch (e) {
          console.error("Failed to apply torch constraint", e);
        }
      }
    }
  }, [torchOn, torchSupported]);

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
