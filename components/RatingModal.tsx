
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import LottieAnimation from './LottieAnimation';
import { successAnimationData } from '../animations/successAnimation';

interface RatingModalProps {
  isOpen: boolean;
  onComplete: (feedback: { type: 'like' | 'dislike', message: string } | null) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onComplete }) => {
  const { getTranslation, currentScreen } = useAppContext();
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoCloseTimerRef = useRef<number | null>(null);

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

  const clearAutoCloseTimer = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setRating(null);
      setFeedback('');
      setIsSubmitted(false);
      setIsSubmitting(false);
      
      autoCloseTimerRef.current = window.setTimeout(() => {
        onComplete(null);
      }, 4000);
    }

    return () => {
      clearAutoCloseTimer();
    };
  }, [isOpen, onComplete]);

  const handleInteraction = () => {
    clearAutoCloseTimer();
  };
  
  const handleRating = (newRating: 'like' | 'dislike') => {
    handleInteraction();
    setRating(newRating);
    if (newRating === 'like') {
      setFeedback('');
    }
  };

  const handleSubmit = async () => {
    handleInteraction();
    if (rating && !isSubmitting) {
      setIsSubmitting(true);
      // The parent component now handles logging.
      setIsSubmitting(false);
      
      setIsSubmitted(true);
      setTimeout(() => {
        onComplete({ type: rating, message: feedback });
      }, 1500);
    }
  };

  const handleSkip = () => {
    // Prevent skipping if we are already in the submission/success process
    if (isSubmitted || isSubmitting) return;
    
    handleInteraction();
    onComplete(null);
  }

  if (!isOpen) return null;

  const likeButtonClass = `
    flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300
    ${rating === 'like' ? 'bg-green-400/30 border-green-500 scale-105 shadow-lg' : 'bg-white/50 border-transparent hover:bg-white/75'}`
  ;
  
  const dislikeButtonClass = `
    flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300
    ${rating === 'dislike' ? 'bg-red-400/30 border-red-500 scale-105 shadow-lg' : 'bg-white/50 border-transparent hover:bg-white/75'}`
  ;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100] p-4 animate-fadeIn" 
      onClick={handleSkip} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="rating-modal-title"
      onTouchMove={(e) => e.preventDefault()}
    >
      <div 
        className="glass-panel p-6 max-w-sm w-full animate-scaleUpWiggle relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
        onPointerDown={handleInteraction}
        onKeyDown={handleInteraction}
        role="document"
      >
        
        {isSubmitted ? (
          <div className="text-center py-4">
            <LottieAnimation
              animationData={successAnimationData}
              loop={false}
              className="w-32 h-32 mx-auto"
              title="Success Animation"
            />
            <h3 className="text-xl font-bold heading-font mt-2">Thank you!</h3>
            <p className="text-sm text-[var(--day-text-secondary)]">Your feedback is appreciated.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 id="rating-modal-title" className="text-xl font-bold heading-font mb-2">{getTranslation('ratingModalTitle')}</h2>
              <p className="text-sm text-[var(--day-text-secondary)]">{getTranslation('ratingModalSubtitle')}</p>
            </div>

            <div className="flex gap-4 mb-4">
              <button onClick={() => handleRating('like')} className={likeButtonClass} aria-pressed={rating === 'like'}>
                <span className="text-4xl mb-2">👍</span>
                <span className={`font-semibold ${rating === 'like' ? 'text-green-700' : 'text-gray-800'}`}>{getTranslation('ratingModalLike')}</span>
              </button>
              <button onClick={() => handleRating('dislike')} className={dislikeButtonClass} aria-pressed={rating === 'dislike'}>
                <span className="text-4xl mb-2">👎</span>
                <span className={`font-semibold ${rating === 'dislike' ? 'text-red-700' : 'text-gray-800'}`}>{getTranslation('ratingModalDislike')}</span>
              </button>
            </div>

            {rating === 'dislike' && (
              <div className="mb-4 animate-fadeIn">
                <textarea
                  value={feedback}
                  onChange={(e) => {
                      handleInteraction();
                      setFeedback(e.target.value);
                  }}
                  placeholder={getTranslation('ratingModalFeedbackPlaceholder')}
                  className="w-full p-2 bg-[rgba(0,0,0,0.05)] border border-transparent rounded-lg focus:ring-2 focus:ring-[var(--day-accent)] focus:border-transparent transition"
                  rows={3}
                  aria-label="Feedback message"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSubmit}
                disabled={!rating || isSubmitting}
                className="w-full accent-button py-3 px-4 flex justify-center items-center disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  getTranslation('ratingModalSend')
                )}
              </button>
              <button
                onClick={handleSkip}
                className="w-full bg-transparent font-semibold py-2 px-4 rounded-xl hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              >
                {getTranslation('ratingModalSkip')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
