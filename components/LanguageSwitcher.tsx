
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  return (
    <button 
        onClick={toggleLanguage}
        className="flex items-center gap-2 rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
    >
        <span className={language === 'th' ? 'text-accent-cyan font-bold' : 'text-slate-500'}>TH</span>
        <span className="text-slate-600">|</span>
        <span className={language === 'en' ? 'text-accent-cyan font-bold' : 'text-slate-500'}>EN</span>
    </button>
  );
};

export default LanguageSwitcher;
