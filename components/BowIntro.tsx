// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_FESTIVE_INTRO_SIG
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

interface BowIntroProps {
  onFinished?: () => void;
}

const BowIntro: React.FC<BowIntroProps> = ({ onFinished }) => {
  const { isFestiveMode } = useAppContext();

  if (!isFestiveMode) return null;

  return (
    <div
      className="
        pointer-events-none
        fixed inset-0 z-[999]
        flex items-center justify-center
        bg-gradient-to-br from-[#5b111c] via-[#3b1a23] to-[#0b2a23]
        overflow-hidden
        animate-bowFadeOut
      "
      onAnimationEnd={onFinished}
    >
      {/* Horizontal Ribbons */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="relative h-12 md:h-16">
          <div className="ribbon-left" />
          <div className="ribbon-right" />
        </div>
      </div>

      {/* Center Bow and Text */}
      <div className="relative flex flex-col items-center gap-4 z-10">
        <div className="bow-icon">
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-[#f6d3a0] to-[#C5A059] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] border-4 border-[#FFF8E1]">
            <span className="text-5xl md:text-6xl drop-shadow-md">🎀</span>
          </div>
        </div>
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#fbe9c8] font-serif-festive animate-pulse font-bold text-shadow-sm">
          Unwrapping your menu...
        </p>
      </div>
    </div>
  );
};

export default BowIntro;