// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Screen } from '../types';

const FloatingCartButton: React.FC = () => {
  const { cart, navigateTo } = useAppContext();
  
  const itemCount = cart.length;

  if (itemCount === 0) return null; 

  return (
    <button
      onClick={() => navigateTo(Screen.Confirmation)} 
      className="fixed bottom-6 right-6 z-[var(--bdl-z-fab)] w-16 h-16 rounded-full bg-[var(--day-accent)] text-white flex items-center justify-center shadow-[var(--bdl-shadow-3)] hover:scale-105 active:scale-95 transition-transform animate-scaleUpWiggle"
      aria-label={`View Order, ${itemCount} items`}
    >
      <span className="text-2xl">🛒</span>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[var(--bdl-neutral-0)]">
          {itemCount}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;