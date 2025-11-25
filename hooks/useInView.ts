import { useEffect, useRef, useState } from 'react';

// A hook to check if an element is visible in the viewport
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      // Update state when intersection changes
      setInView(entry.isIntersecting);
    }, {
      root: null,
      threshold: 0.1, // Trigger when 10% of the element is visible
      ...(options || {}),
    });
    
    observer.observe(currentRef);
    
    // Cleanup observer on component unmount
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return { ref, inView };
}