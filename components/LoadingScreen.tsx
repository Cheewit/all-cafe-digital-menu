import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingScreenProps {
  onLoaded: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const { t } = useLanguage();

  const loadingMessages = useMemo(() => [
      t('loadingMsg1'),
      t('loadingMsg2'),
      t('loadingMsg3'),
      t('loadingMsg4'),
      t('loadingMsg5'),
  ], [t]);

  useEffect(() => {
    if (messageIndex >= loadingMessages.length) {
      const timer = setTimeout(() => {
        onLoaded();
      }, 500);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setMessageIndex(prevIndex => prevIndex + 1);
    }, 700); 

    return () => clearTimeout(timer);
  }, [messageIndex, onLoaded, loadingMessages]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-mono text-cyan-300">
      <div className="text-center">
        <div className="w-full max-w-lg text-left">
          {loadingMessages.slice(0, messageIndex).map((msg, i) => (
            <p key={i} className="text-slate-400">&gt; {msg}</p>
          ))}
          {messageIndex < loadingMessages.length && (
            <p className="flex items-center">
              <span className="mr-2">&gt; {loadingMessages[messageIndex]}</span>
              <span className="w-2 h-4 bg-cyan-300 animate-pulse"></span>
            </p>
          )}
        </div>
        {messageIndex >= loadingMessages.length && (
           <p className="mt-4 text-green-400">&gt; {t('systemReady')}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;