
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { lazy, Suspense, useEffect, useMemo } from 'react';
import { useAppContext }  from './contexts/AppContext';
import { Screen } from './types';
import Header from './components/Header';
import FloatingCartButton from './components/FloatingCartButton';
import LoadingSpinner from './components/LoadingSpinner';
import ToastContainer from './components/ToastContainer';

const WelcomeScreen = lazy(() => import('./components/WelcomeScreen'));
const MenuScreen = lazy(() => import('./components/MenuScreen'));
const CustomizationScreen = lazy(() => import('./components/CustomizationScreen'));
const ConfirmationScreen = lazy(() => import('./components/ConfirmationScreen'));

const App: React.FC = () => {
  const { currentScreen, isGeneratingQR, getTranslation, appTheme, isFestiveMode } = useAppContext();

  // Effect to update document title based on app state.
  useEffect(() => {
    document.title = isFestiveMode ? 'ALL CAFÉ — Merry Christmas' : 'ALL CAFÉ — BaristA:i Menu';
  }, [isFestiveMode]);

  const getScreenClasses = (screenType: Screen) => {
    // Optimized for Mobile Transitions:
    // 1. transform-gpu: Forces hardware acceleration (translate3d) for smoother animations on Android/iOS
    // 2. transition-opacity + duration-500: Slower, more deliberate fade looks more "native"
    // 3. pb-[env(safe-area-inset-bottom, 48px)]: Handles iPhone home bar area automatically
    
    // UPDATE: Ensure scrolling is allowed on all screens (including Welcome) so content isn't cut off on small screens.
    const scrollBehavior = 'overflow-y-auto';

    const base = `fixed inset-0 p-4 pt-[70px] md:pt-[80px] pb-[env(safe-area-inset-bottom,80px)] ${scrollBehavior} transition-opacity duration-500 ease-[var(--bdl-ease-out)] transform-gpu`;
    return currentScreen === screenType ? `${base} opacity-100 z-10` : `${base} opacity-0 pointer-events-none z-0`;
  };

  const FullScreenLoader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
      <LoadingSpinner />
    </div>
  );

  const QRLoader = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center z-[200] animate-fadeIn">
      <LoadingSpinner />
      <p className="text-white font-semibold mt-4 text-lg">
        {getTranslation('generatingQRCode')}
      </p>
    </div>
  );

  // Generate snowflakes for the festive mode
  // Updated: Faster speed (5-13s) so users see them quickly
  const snowflakes = useMemo(() => {
    if (!isFestiveMode) return null;
    return Array.from({ length: 20 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 5; // Reduced delay (0-5s)
      const duration = 5 + Math.random() * 8; // Faster duration (5s - 13s)
      const size = 3 + Math.random() * 3;
      const opacity = 0.4 + Math.random() * 0.5; // Slightly more visible
      return (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            opacity: opacity,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          }}
        />
      );
    });
  }, [isFestiveMode]);

  return (
    <div className="min-h-screen">
      {/* ==== Background System ==== */}
      {/* Base Container with Gradient Brand Color (Coffee Theme) for All Café */}
      <div className={`fixed inset-0 w-full h-full z-[-1] overflow-hidden transition-all duration-1000 
          ${isFestiveMode 
             ? 'festive-gradient-bg' // Christmas Image
             : 'bg-gradient-to-br from-[#9D7B65] via-[#6D4C41] to-[#2C1810]' // Standard Coffee
          }`}>
        
        {/* Layer 1.5: Festive Vignette & Bokeh Overlay */}
        {isFestiveMode && <div className="festive-overlay" />}

        {/* Santa Sleigh Animation (Festive Mode Only) */}
        {isFestiveMode && (
           <div className="santa-sleigh">
              <img src="https://i.postimg.cc/Kz3SrC6Q/Christmas_(2).png" alt="Santa Sleigh" className="w-full h-auto drop-shadow-lg" />
           </div>
        )}

        {/* Layer 2: All Select Theme - Smooth Gradient Overlay */}
        {/* This sits ON TOP of the coffee/festive gradient and fades in when theme changes to 'allselect' */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#2B547E] via-[#0A2F56] to-[#021024] transition-opacity duration-1000 ease-in-out ${appTheme === 'allselect' && !isFestiveMode ? 'opacity-100' : 'opacity-0'}`} />

        {/* Layer 3: Global Tint Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        
        {/* Layer 4: Festive Snow Overlay */}
        {isFestiveMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
             {snowflakes}
          </div>
        )}
      </div>
      
      {/* Layer 5: Festive Foreground Frame (Bottom) - Hidden on Confirmation Screen */}
      {/* Customization Screen: Lower Z-Index so buttons appear above the frame */}
      {isFestiveMode && currentScreen !== Screen.Confirmation && (
        <div className={`fixed bottom-0 left-0 right-0 pointer-events-none flex justify-center items-end ${currentScreen === Screen.Customization ? 'z-[5]' : 'z-[60]'}`}>
          {/* Updated: Increased width to 160% on mobile to scale up the frame details */}
          <img 
            src="https://i.postimg.cc/W3qL6xBC/Christmas_(1).png" 
            alt=""
            className="w-[160%] max-w-none sm:w-full h-auto object-contain mb-[-2%] sm:mb-0"
          />
        </div>
      )}

      <div>
        <Header />
        <main>
          <Suspense fallback={<FullScreenLoader />}>
            <div id={`screen-${Screen.Welcome}`} className={getScreenClasses(Screen.Welcome)}><WelcomeScreen /></div>
            <div id={`screen-${Screen.Menu}`} className={getScreenClasses(Screen.Menu)}><MenuScreen /></div>
            <div id={`screen-${Screen.Customization}`} className={getScreenClasses(Screen.Customization)}><CustomizationScreen /></div>
            <div id={`screen-${Screen.Confirmation}`} className={getScreenClasses(Screen.Confirmation)}><ConfirmationScreen /></div>
          </Suspense>
        </main>

        {isGeneratingQR && <QRLoader />}

        {currentScreen === Screen.Menu && <FloatingCartButton />}
      </div>
      
      <ToastContainer />
      
      {/* Powered by BaristA:i Badge - Hidden on Confirmation Screen to avoid overlap with Start New Order button */}
      <div className={`fixed right-2 bottom-2 z-50 pointer-events-none transition-opacity duration-300 ${currentScreen === Screen.Confirmation ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`backdrop-blur-md bg-black/40 text-white px-3 py-1.5 rounded-full border border-white/10 text-[11px] flex items-center gap-1.5 ${isFestiveMode ? 'border-[#C5A059]/40 bg-[#1A3C34]/80 shadow-lg shadow-black/20' : ''}`}>
          {isFestiveMode ? (
            <>
              <span className="inline-block text-white/80">❆</span>
              Powered by <span className="font-semibold ml-1 text-[#E8E4D0]">BaristA:i</span>
            </>
          ) : (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Powered by <span className="font-semibold ml-1">BaristA:i</span>
              <span className="opacity-70">&nbsp;for&nbsp;ALL CAFÉ</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
