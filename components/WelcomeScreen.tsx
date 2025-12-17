// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Screen, LanguageKey } from '../types';
import { LANGUAGES } from '../constants/languages';
import CreditText from './CreditText';
import LoadingSpinner from './LoadingSpinner';
import { triggerLightHaptic } from '../utils/haptics';

const InitialHelpModal = lazy(() => import('./InitialHelpModal'));

const WelcomeScreen: React.FC = () => {
  const { navigateTo, selectedLanguage, updateLanguage, getTranslation, productsLoading, isFestiveMode, setFestiveMode } = useAppContext();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showInteractionHint, setShowInteractionHint] = useState(false);

  // Effect for the welcome overlay logic
  useEffect(() => {
    // Set a timer for the minimum display duration before transitioning
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500); // A bit of time for branding

    return () => clearTimeout(timer);
  }, []);

  // Effect to hide the overlay when conditions are met
  useEffect(() => {
    // Hide overlay only when minimum time has passed AND products are no longer loading
    if (minTimeElapsed && !productsLoading) {
      setShowWelcomeOverlay(false);
      
      const hasSeenModal = sessionStorage.getItem('hasSeenInitialHelp');
      if (!hasSeenModal) {
        // Show the help modal once per session after the transition
        const helpTimer = setTimeout(() => {
          setIsHelpModalOpen(true);
          sessionStorage.setItem('hasSeenInitialHelp', 'true');
        }, 700); // Delay to match transition duration
        return () => clearTimeout(helpTimer);
      }
      
      // Show hint after a few seconds if user hasn't clicked
      const hintTimer = setTimeout(() => {
          setShowInteractionHint(true);
      }, 2500);
      return () => clearTimeout(hintTimer);
    }
  }, [minTimeElapsed, productsLoading]);


  const handleLanguageSelect = (langKey: LanguageKey) => {
    updateLanguage(langKey);
  };

  const handleStartOrder = () => {
    triggerLightHaptic();
    navigateTo(Screen.Menu);
  };
  
  const handleCloseHelpModal = () => {
    setIsHelpModalOpen(false);
  };

  const logoSrc = isFestiveMode 
    ? 'https://i.postimg.cc/ydk08yw2/chritmas-logo.png' 
    : 'https://i.postimg.cc/TPr9kKyf/all-cafe-logo.png';

  return (
    <>
      {/* ===== New Loading Overlay with Warp Transition ===== */}
      <div 
        className={`fixed inset-0 bg-[#D7B49E] flex flex-col justify-center items-center text-center p-8 z-[110] transition-opacity duration-700 ease-in-out
                    ${showWelcomeOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={`transition-all duration-700 ease-in-out ${!showWelcomeOverlay && 'scale-[2.5]'}`}>
          <img 
            src={logoSrc}
            alt="ALL CAFÉ Logo" 
            className="w-48 md:w-64 mb-6 mx-auto"
          />
          <h1 className="text-4xl md:text-5xl font-bold heading-font text-white mb-8 drop-shadow-lg">
            {getTranslation('welcomeToAllCafe')}
          </h1>
        </div>
        <div className={`transition-opacity duration-300 ${!showWelcomeOverlay && 'opacity-0'} flex flex-col items-center`}>
          <LoadingSpinner />
          <p className="text-white/80 mt-4 text-lg">{getTranslation('loadingMenu')}</p>
        </div>
      </div>
      
      <Suspense fallback={null}>
        {isHelpModalOpen && <InitialHelpModal isOpen={isHelpModalOpen} onClose={handleCloseHelpModal} />}
      </Suspense>
      
      <div className={`flex flex-col items-center justify-center min-h-full p-4 transition-opacity duration-500 delay-300 ${showWelcomeOverlay ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full max-w-md p-6 md:p-8 glass-panel relative">
          <div className="text-center mb-6">
            <img 
              src={logoSrc} 
              alt="ALL CAFÉ Logo" 
              className="mx-auto mb-6 w-auto h-auto max-w-[180px] md:max-w-[220px] animate-gentlePulse" 
            />
            {/* Use static text as requested by the user */}
            <p>เลือกภาษา / Choose language:</p>
          </div>
          
          <div className="mb-8">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <button
                  key={key}
                  onClick={() => handleLanguageSelect(key as LanguageKey)}
                  className={`flex flex-col items-center p-3 rounded-[var(--bdl-radius-md)] transition-all duration-300
                              ${selectedLanguage === key 
                                ? 'bg-black/10 ring-2 ring-offset-2 ring-offset-transparent ring-[var(--bdl-neutral-600)]' 
                                : 'bg-black/5 hover:bg-black/10'}`}
                >
                  <span className="text-2xl mb-1">{lang.flag}</span>
                  <span className="text-xs text-center">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 relative">
            <button
              onClick={handleStartOrder}
              className="w-full accent-button py-3 px-4 flex items-center justify-center relative z-10"
            >
              <span>{getTranslation('startOrder')}</span>
            </button>
            
            {/* Interactive Ghost Finger Pointer */}
            {showInteractionHint && !isHelpModalOpen && (
                <div className="absolute -bottom-10 right-10 pointer-events-none z-20 animate-handTap">
                    <span className="text-5xl filter drop-shadow-md">👆</span>
                </div>
            )}
          </div>

          {/* Testing Button for Festive Mode */}
          <div className="mt-4 flex justify-center">
            <button 
                onClick={() => setFestiveMode(!isFestiveMode)}
                className="text-[10px] text-[var(--bdl-text-secondary)] hover:text-[var(--bdl-brand)] transition-colors border border-black/10 rounded px-3 py-1 opacity-60 hover:opacity-100"
            >
                {isFestiveMode ? '❄️ Back to Classic' : '🎄 Preview Holiday Magic'}
            </button>
          </div>
          
          <CreditText />
        </div>
      </div>
    </>
  );
};

export default WelcomeScreen;