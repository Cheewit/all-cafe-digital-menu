
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { LANGUAGES } from '../constants/languages';
import { LanguageKey, Screen } from '../types';

const HelpModal = lazy(() => import('./HelpModal'));

const Header: React.FC = () => {
  const { selectedLanguage, updateLanguage, getTranslation, currentScreen, navigateTo, omniContext, isFestiveMode, clearCart } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLanguageSelect = (langKey: LanguageKey) => {
    updateLanguage(langKey);
    setIsDropdownOpen(false);
  };

  const handleHomeClick = () => {
    clearCart();
    navigateTo(Screen.Welcome);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const greetingMessage = useMemo(() => {
    if (isFestiveMode) {
        // Static, elegant message for festive mode
        return "Merry Christmas";
    }
    const timeOfDay = omniContext?.timeOfDay;
    let key = 'greetingDefault';
    switch (timeOfDay) {
      case 'morning':
        key = 'greetingMorning';
        break;
      case 'midday':
        key = 'greetingMidday';
        break;
      case 'afternoon':
        key = 'greetingAfternoon';
        break;
      case 'evening':
        key = 'greetingEvening';
        break;
      case 'night':
      case 'late-night':
        key = 'greetingNight';
        break;
    }
    return getTranslation(key);
  }, [omniContext, getTranslation, isFestiveMode]);


  if (currentScreen === Screen.Welcome) {
    return null; // No header on welcome screen
  }

  const currentLangInfo = LANGUAGES[selectedLanguage];

  const logoSrc = isFestiveMode 
    ? 'https://i.postimg.cc/ydk08yw2/chritmas-logo.png' 
    : 'https://i.postimg.cc/TPr9kKyf/all-cafe-logo.png';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[60px] md:h-[70px] flex items-center justify-between px-4 z-50">
        {/* Left Section: Logo */}
        <div className="flex items-center relative">
          {isFestiveMode && (
            <div className="absolute -top-2 -left-1 pointer-events-none filter drop-shadow-sm opacity-80">
               {/* Subtle festive decoration if needed */}
            </div>
          )}
          <img
            src={logoSrc}
            alt={getTranslation('cafeName')}
            className="h-10 md:h-12 cursor-pointer"
            onClick={handleHomeClick}
          />
        </div>

        {/* Middle Section: Centered Text (Absolute Positioning) */}
        {currentScreen === Screen.Menu && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
             {isFestiveMode ? (
                 <span className="hidden sm:inline-block font-serif-festive text-[#C5A059] text-xl tracking-wide festive-text-gold font-bold italic">
                    {greetingMessage}
                 </span>
             ) : (
                <span className="hidden sm:inline-block text-xs italic px-2 py-1 rounded-md shadow-xs">
                  {greetingMessage}
                </span>
             )}
          </div>
        )}
        
        {/* Right Section: Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={handleHomeClick}
            className="p-2 rounded-full transition-colors"
            aria-label={getTranslation('home')}
            title={getTranslation('home')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
           <button
            onClick={() => setIsHelpModalOpen(true)}
            className="p-2 rounded-full transition-colors"
            aria-label={getTranslation('helpButtonLabel')}
            title={getTranslation('helpButtonLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center py-2 px-3 rounded-full transition-colors"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <span className="mr-2 text-lg">{currentLangInfo.flag}</span>
              <span className="text-sm hidden sm:inline">{currentLangInfo.name}</span>
              <span className="ml-1 text-xs">▼</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-auto min-w-[150px] overflow-hidden z-[100] glass-panel p-1">
                {Object.entries(LANGUAGES).map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => handleLanguageSelect(key as LanguageKey)}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors rounded-lg ${selectedLanguage === key ? 'bg-black/10' : 'hover:bg-black/5'}`}
                  >
                    <span className="mr-3 text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <Suspense fallback={null}>
        {isHelpModalOpen && <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />}
      </Suspense>
    </>
  );
};

export default Header;
