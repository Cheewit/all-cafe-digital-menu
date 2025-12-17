import React, { useMemo } from 'react';
import { ActiveFilter } from '../App';
import Card from './Card';

// Mapping from language codes to display names and flag emojis.
const languageMap: { [key: string]: { name: string; flag: string } } = {
  'th-TH': { name: 'Thai', flag: '🇹🇭' },
  'en-US': { name: 'English', flag: '🇺🇸' },
  'ja-JP': { name: 'Japanese', flag: '🇯🇵' },
  'zh-CN': { name: 'Chinese', flag: '🇨🇳' },
  'ko-KR': { name: 'Korean', flag: '🇰🇷' },
  'ms-MY': { name: 'Malay', flag: '🇲🇾' },
  'fr-FR': { name: 'French', flag: '🇫🇷' },
  'vi-VN': { name: 'Vietnamese', flag: '🇻🇳' },
  'hi-IN': { name: 'Indian', flag: '🇮🇳' },
};

interface LanguageFilterProps {
  availableLanguages: string[];
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter | null) => void;
}

const LanguageFilter: React.FC<LanguageFilterProps> = ({ availableLanguages, activeFilter, onFilterChange }) => {
  const activeLanguage = activeFilter?.type === 'language' ? activeFilter.value : null;

  const handleFilterClick = (langCode: string | null) => {
    // If the clicked filter is already active, clear it. Otherwise, set it.
    if (activeLanguage === langCode) {
      onFilterChange(null);
    } else if (langCode === null) {
      onFilterChange(null);
    }
    else {
      onFilterChange({ type: 'language', value: langCode });
    }
  };

  const buttonClass = (isActive: boolean) =>
    `flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan ` +
    (isActive
      ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50'
      : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800 border-slate-700');

  const languagesToShow = useMemo(() => {
    const known = Object.entries(languageMap)
        .filter(([code]) => availableLanguages.includes(code))
        .map(([code, meta]) => ({ code, ...meta }));

    const unknown = availableLanguages
        .filter(code => code && !Object.prototype.hasOwnProperty.call(languageMap, code))
        .map(code => ({ code, name: code, flag: '🏳️' })); // Fallback
        
    return [...known, ...unknown].sort((a, b) => a.name.localeCompare(b.name));
  }, [availableLanguages]);

  // Don't render if there's no language data at all.
  if (languagesToShow.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <h4 className="text-base font-semibold text-slate-100 mb-3">Filter Sales by Language</h4>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleFilterClick(null)}
          className={buttonClass(activeLanguage === null)}
        >
          <span role="img" aria-label="Globe">🌐</span> All Languages
        </button>
        {languagesToShow.map(({ code, name, flag }) => (
          <button
            key={code}
            onClick={() => handleFilterClick(code)}
            className={buttonClass(activeLanguage === code)}
          >
            <span role="img" aria-label={`${name} flag`}>{flag}</span>
            <span>{name}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default LanguageFilter;