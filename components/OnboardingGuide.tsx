
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_ONBOARDING_SIG
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

export interface GuideStep {
    elementId: string;
    textKey: string;
    gesture: 'swipe' | 'tap';
    position?: 'top' | 'bottom';
}

interface OnboardingGuideProps {
  steps: GuideStep[];
  onComplete: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ steps, onComplete }) => {
  const { getTranslation, isFestiveMode } = useAppContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isFullWidth, setIsFullWidth] = useState(false);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const updateTargetPosition = () => {
        const el = document.getElementById(currentStep.elementId);
        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
            // Check if element effectively spans the screen width (like the category bar)
            // If it covers more than 90% of screen width, treat as full width to prevent ugly side gaps
            setIsFullWidth(rect.width >= window.innerWidth * 0.9);
            
            // Smoothly scroll element into view if needed
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Delay to ensure rendering is complete and animations settle
    const timer = setTimeout(updateTargetPosition, 100); 
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition); // Update on scroll too
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition);
    }
  }, [currentStepIndex, currentStep]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!targetRect) return null;

  // Visual tweaks for the highlight box
  // If full width, snap to edges (left 0, width 100%)
  const highlightStyle: React.CSSProperties = isFullWidth 
      ? {
          top: targetRect.top,
          left: 0,
          width: '100%',
          height: targetRect.height,
          borderRadius: 0,
      } 
      : {
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          borderRadius: 16, // var(--bdl-radius-md)
      };

  // Hand position
  const handStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${targetRect.top + targetRect.height / 2}px`,
      left: `${targetRect.left + targetRect.width / 2}px`,
      zIndex: 9999,
      pointerEvents: 'none',
      fontSize: '3.5rem',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
  };
  
  const animClass = currentStep.gesture === 'swipe' ? 'animate-handSwipe' : 'animate-handTap';

  // Tooltip position
  const tooltipTop = currentStep.position === 'top' 
    ? targetRect.top - 100 
    : targetRect.bottom + 40;

  return (
    <div 
        className="fixed inset-0 z-[200] overflow-hidden" 
        onClick={nextStep} 
    >
      {/* Spotlight Effect using Box Shadow on the highlight element */}
      <div 
        className="absolute transition-all duration-300 ease-out shadow-[0_0_0_9999px_rgba(0,0,0,0.75)]"
        style={{
            ...highlightStyle,
            // Border & Glow - Replacing dashed border with premium solid glow
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.75), 0 0 25px rgba(255,255,255,0.4) inset',
            border: '2px solid rgba(255,255,255,0.8)'
        }}
      >
          {/* Subtle pulse effect inside highlight */}
          <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
      </div>

      {/* Ghost Hand Animation */}
      <div style={handStyle} className={animClass}>
         {isFestiveMode ? '🧤' : '👆'}
      </div>

      {/* Text Tooltip */}
      <div 
        className="absolute w-full flex flex-col items-center pointer-events-none transition-all duration-300 ease-out px-6"
        style={{
            top: tooltipTop,
        }}
      >
          <div className="glass-panel bg-white/95 backdrop-blur-xl text-neutral-900 px-6 py-4 rounded-2xl shadow-2xl border border-white/50 text-center max-w-xs animate-slideUpFadeIn">
              <p className="font-bold text-lg leading-tight">
                  {getTranslation(currentStep.textKey)}
              </p>
          </div>
          <p className="text-white/70 text-xs mt-3 font-medium animate-pulse drop-shadow-md">
              ({getTranslation('tapAnywhereToContinue') || 'Tap anywhere to continue'})
          </p>
      </div>
    </div>
  );
};

export default OnboardingGuide;
