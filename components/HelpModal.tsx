// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { getTranslation, currentScreen } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  // Lock body scroll when modal is open
  useEffect(() => {
    const lockScroll = (locked: boolean) => {
      document.body.style.overflow = locked ? 'hidden' : '';
      // Lock current screen container
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
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start md:items-center z-[100] pt-20 md:pt-0 animate-fadeIn" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="help-modal-title"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div ref={modalRef} className="glass-panel p-6 m-4 max-w-sm w-full animate-scaleUpWiggle relative" onClick={e => e.stopPropagation()}>
        <h2 id="help-modal-title" className="text-2xl font-bold heading-font text-center mb-4">{getTranslation('howToOrderTitle')}</h2>
        <ul className="space-y-3 text-left">
          <li className="flex items-start text-base"><span className="mr-3 text-lg" aria-hidden="true">1. 🌐</span> <div>{getTranslation('howToOrderStep1')}</div></li>
          <li className="flex items-start text-base"><span className="mr-3 text-lg" aria-hidden="true">2. 🥤</span> <div>{getTranslation('howToOrderStep2')}</div></li>
          <li className="flex items-start text-base"><span className="mr-3 text-lg" aria-hidden="true">3. ⚙️</span> <div>{getTranslation('howToOrderStep3')}</div></li>
          <li className="flex items-start text-base"><span className="mr-3 text-lg" aria-hidden="true">4. 📱</span> <div>{getTranslation('howToOrderStep4')}</div></li>
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full accent-button py-3 px-4"
          aria-label={getTranslation('gotItButton')}
        >
          {getTranslation('gotItButton')}
        </button>
      </div>
    </div>
  );
};

export default HelpModal;