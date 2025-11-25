// Fix: Import React to resolve the 'React' namespace for React.RefObject.
import React, { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, isOpen: boolean) => {
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Fix: Use a type guard to ensure `el` is an HTMLElement before accessing `offsetParent`.
    // This fixes the error "Property 'offsetParent' does not exist on type 'unknown'".
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS)
    ).filter((el): el is HTMLElement => el instanceof HTMLElement && el.offsetParent !== null); // Ensure element is visible

    if (focusableElements.length === 0) return;
    
    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    // Initially focus the first element
    firstFocusableRef.current.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else { // Tab
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, containerRef]);
};
