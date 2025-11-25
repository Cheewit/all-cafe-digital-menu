
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import React, { useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';

// TypeScript declaration for the new global QRCode library (davidshimjs/qrcodejs)
declare namespace QRCode {
  interface Options {
    text?: string;
    width?: number;
    height?: number;
    colorDark?: string;
    colorLight?: string;
    correctLevel?: number; // 0 (L), 1 (M), 2 (Q), 3 (H)
    useSVG?: boolean; // Some versions support SVG output
  }
  const CorrectLevel: {
    L: number;
    M: number;
    Q: number;
    H: number;
  };
}
declare class QRCode {
  constructor(element: HTMLElement | string, options: string | QRCode.Options);
  makeCode(text: string): void;
  clear(): void;
}

interface QRCodeDisplayProps {
  text: string | number | undefined; 
  size?: number;
  brand?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ text, size = 160, brand }) => {
  const { isFestiveMode } = useAppContext();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCode | null>(null); 

  // Helper to safely clear the contents of a DOM node without using innerHTML
  const clearNode = (node: HTMLElement | null) => {
    if (!node) return;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };

  useEffect(() => {
    const container = qrRef.current;
    if (!container) return;

    if (typeof QRCode === 'undefined') {
      clearNode(container);
      const errorElement = document.createElement('p');
      errorElement.className = "text-red-500 text-center p-2 text-xs";
      errorElement.textContent = "QR Library Error";
      container.appendChild(errorElement);
      return;
    }

    const currentText = String(text ?? '');

    if (qrInstanceRef.current) {
      qrInstanceRef.current.clear();
      if (currentText) {
        try {
          qrInstanceRef.current.makeCode(currentText);
        } catch (error) {
          // Fallback logic often handled by new instance creation if makeCode fails on specific libs
        }
      }
    } else {
      // Create new instance
      clearNode(container);
      if (currentText) {
        try {
          qrInstanceRef.current = new QRCode(container, {
            text: currentText,
            width: size, 
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            // Use High Error Correction Level to allow for the central logo overlay
            correctLevel: QRCode.CorrectLevel.H, 
          });
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      }
    }
    
    // Force responsive styling on the generated image/canvas
    const img = container.querySelector('img');
    if (img) {
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
    }
    const canvas = container.querySelector('canvas');
    if (canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'contain';
    }

  }, [text, size]); 

  const logoUrl = useMemo(() => {
    const b = (brand || '').toLowerCase();
    if (b.includes('all select') || b.includes('allselect')) {
        return 'https://i.postimg.cc/jSMh7QYM/Untitled_design.jpg';
    }
    // Default to All Cafe logo
    return isFestiveMode 
      ? 'https://i.postimg.cc/ydk08yw2/chritmas-logo.png'
      : 'https://i.postimg.cc/qgfsNBYW/all_cafe_logo.png';
  }, [brand, isFestiveMode]);

  // Wrapper ensures correct positioning context for the overlay
  return (
    <div className="relative w-full h-full flex items-center justify-center">
        <div 
            ref={qrRef} 
            className="flex justify-center items-center bg-white overflow-hidden w-full h-full"
        >
        </div>
        
        {/* Brand Logo Overlay - Positioned in center to help staff identify the brand */}
        {text && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white rounded-lg p-1 shadow-sm border border-stone-100 flex items-center justify-center" style={{ width: '22%', height: '22%' }}>
                    <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        )}
    </div>
  );
};

export default QRCodeDisplay;
