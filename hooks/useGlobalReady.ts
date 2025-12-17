import { useEffect, useState } from 'react';

export default function useGlobalReady(flagName: string, interval = 100) {
  const [ready, setReady] = useState<boolean>(() => !!(window as any)[flagName]);
  useEffect(() => {
    if (ready) return;
    const id = setInterval(() => {
      if ((window as any)[flagName]) {
        setReady(true);
        clearInterval(id);
      }
    }, interval);
    return () => clearInterval(id);
  }, [flagName, ready, interval]);
  return ready;
}
