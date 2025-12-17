// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { LANGUAGES } from '../constants/languages';
import { LanguageKey, Screen } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface InitialHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InitialHelpModal: React.FC<InitialHelpModalProps> = ({ isOpen, onClose }) => {
  const { getTranslation, selectedLanguage, updateLanguage } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  // Lock body scroll when modal is open
  useEffect(() => {
    const lockScroll = (locked: boolean) => {
      document.body.style.overflow = locked ? 'hidden' : '';
      // Also lock the specific screen container if possible
      const screenEl = document.getElementById(`screen-${Screen.Welcome}`);
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
  }, [isOpen]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLanguageSelect = (langKey: LanguageKey) => {
    updateLanguage(langKey);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] animate-fadeIn" 
      // Prevent touch move on overlay to stop scroll propagation
      onTouchMove={(e) => e.preventDefault()}
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="initial-help-modal-title"
    >
      <div 
        ref={modalRef}
        className="glass-panel p-6 m-4 max-w-sm w-full animate-scaleUpWiggle relative" 
        onClick={e => e.stopPropagation()}
        // Allow touch move inside modal if needed, but for this modal content usually fits. 
        // If content overflows, we might need to stop propagation conditionally.
      >
        <h2 id="initial-help-modal-title" className="text-2xl font-bold heading-font text-center mb-4">
          {getTranslation('howToOrderTitle')}
        </h2>

        <div className="relative mb-4" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="w-full flex items-center justify-between py-2 px-3 bg-[rgba(0,0,0,0.05)] rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.1)]"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex items-center">
              <span className="mr-2 text-lg">{LANGUAGES[selectedLanguage].flag}</span>
              <span className="text-sm">{LANGUAGES[selectedLanguage].name}</span>
            </div>
            <span className="ml-1 text-xs">▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg shadow-lg z-[110] p-1 glass-panel">
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <button
                  key={key}
                  onClick={() => handleLanguageSelect(key as LanguageKey)}
                  className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors rounded-md ${selectedLanguage === key ? 'bg-[rgba(0,0,0,0.1)] font-semibold' : 'hover:bg-[rgba(0,0,0,0.05)]'}`}
                >
                  <span className="mr-3 text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <ul className="space-y-3 text-left">
          <li className="flex items-start text-base">
            <span className="mr-3 text-lg" aria-hidden="true">1. 🥤</span> 
            <div>{getTranslation('howToOrderStep1')}</div>
          </li>
          <li className="flex items-start text-base">
            <span className="mr-3 text-lg" aria-hidden="true">2. ⚙️</span> 
            <div>{getTranslation('howToOrderStep2')}</div>
          </li>
          <li className="flex items-start text-base">
            <span className="mr-3 text-lg" aria-hidden="true">3. 🛒</span> 
            <div>{getTranslation('howToOrderStep3')}</div>
          </li>
          <li className="flex items-start text-base">
            <span className="mr-3 text-lg" aria-hidden="true">4. 📱</span> 
            <div>{getTranslation('howToOrderStep4')}</div>
          </li>
        </ul>

        <p className="text-center italic mt-4 text-[var(--bdl-text-secondary)]">
            {getTranslation('initialHowToOrderClosing')}
        </p>
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

export default InitialHelpModal;