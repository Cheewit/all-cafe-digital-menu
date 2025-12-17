// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { useState, useEffect } from 'react';

export const usePrefersReducedMotion = () => {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduce(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduce;
};
