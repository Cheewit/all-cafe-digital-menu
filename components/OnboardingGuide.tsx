
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

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const updateTargetPosition = () => {
        const el = document.getElementById(currentStep.elementId);
        if (el) {
            setTargetRect(el.getBoundingClientRect());
            // Smoothly scroll element into view if needed
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Delay to ensure rendering is complete and animations settle
    const timer = setTimeout(updateTargetPosition, 600);
    window.addEventListener('resize', updateTargetPosition);
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTargetPosition);
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

  // Calculate hand position relative to the element
  const handStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${targetRect.top + targetRect.height / 2}px`,
      left: `${targetRect.left + targetRect.width / 2}px`,
      zIndex: 9999,
      pointerEvents: 'none',
      fontSize: '3rem',
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
  };
  
  const animClass = currentStep.gesture === 'swipe' ? 'animate-handSwipe' : 'animate-handTap';

  return (
    <div 
        className="fixed inset-0 z-[200] overflow-hidden" 
        onClick={nextStep} // Tap anywhere to dismiss/advance
    >
      {/* Semi-transparent Backdrop */}
      <div className="absolute inset-0 bg-black/60 transition-opacity duration-500"></div>

      {/* Target Highlight Box (Visual Only) */}
      <div 
        className="absolute transition-all duration-500 ease-out border-2 border-dashed border-white/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
        style={{
            top: targetRect.top - 5,
            left: targetRect.left - 5,
            width: targetRect.width + 10,
            height: targetRect.height + 10,
        }}
      ></div>

      {/* Ghost Hand Animation */}
      <div style={handStyle} className={animClass}>
         {isFestiveMode ? '🧤' : '👆'}
      </div>

      {/* Text Tooltip */}
      <div 
        className="absolute w-full text-center pointer-events-none transition-all duration-500 ease-out px-4"
        style={{
            top: currentStep.position === 'top' ? targetRect.top - 80 : targetRect.bottom + 20,
        }}
      >
          <div className="inline-block bg-white text-neutral-900 px-6 py-3 rounded-full shadow-xl font-bold text-lg animate-bounce">
              {getTranslation(currentStep.textKey)}
          </div>
          <p className="text-white/80 text-sm mt-4">
              (Tap anywhere to continue)
          </p>
      </div>
    </div>
  );
};

export default OnboardingGuide;
