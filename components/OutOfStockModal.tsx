// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface OutOfStockModalProps {
  isOpen: boolean;
  onClose: () => void; // This is the primary action, e.g., navigating back to the menu
  productName: string;
}

const OutOfStockModal: React.FC<OutOfStockModalProps> = ({ isOpen, onClose, productName }) => {
  const { getTranslation, currentScreen } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  // Lock body scroll when modal is open
  useEffect(() => {
    const lockScroll = (locked: boolean) => {
      document.body.style.overflow = locked ? 'hidden' : '';
      const screenEl = document.getElementById(`screen-${currentScreen}`);
      if (screenEl) {
        screenEl.style.overflow = locked ? 'hidden' : '';
      }
    };

    if (isOpen) {
      lockScroll(true);
    }
    
    return () => {
      lockScroll(false);
    };
  }, [isOpen, currentScreen]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[250] p-4 animate-fadeIn" 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="out-of-stock-title"
        onTouchMove={(e) => e.preventDefault()}
    >
      <div 
        ref={modalRef}
        className="glass-panel p-6 max-w-sm w-full animate-scaleUpWiggle relative text-center" 
        onClick={e => e.stopPropagation()}
      >
        <span className="text-6xl" role="img" aria-label="Ghost emoji">👻</span>
        <h2 id="out-of-stock-title" className="text-2xl font-bold heading-font mt-4 mb-2">
            {getTranslation('outOfStockModalTitle_Staff')}
        </h2>
        <p className="text-base mb-1">({productName})</p>

        <p className="text-sm text-[var(--day-text-secondary)] mb-6">
            {getTranslation('outOfStockModalMessage_Staff')}
        </p>
        
        <button
          onClick={onClose}
          className="mt-4 w-full accent-button py-3 px-4"
          aria-label={getTranslation('goToMenuButton')}
        >
          {getTranslation('goToMenuButton')}
        </button>
      </div>
    </div>
  );
};

export default OutOfStockModal;