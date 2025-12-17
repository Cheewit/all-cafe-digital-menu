// BaristA:i_V4.3_CMK_CODE_SIG
import { LanguageInfo, LanguageKey } from '../types';

export const LANGUAGES: Record<LanguageKey, LanguageInfo> = {
  th: { flag: '🇹🇭', name: 'ไทย' },
  en: { flag: '🇬🇧/🇺🇸', name: 'English' },
  jp: { flag: '🇯🇵', name: '日本語' },
  zh: { flag: '🇨🇳', name: '中文' },
  kr: { flag: '🇰🇷', name: '한국어' },
  my: { flag: '🇲🇾', name: 'Melayu' },
  ru: { flag: '🇷🇺', name: 'Русский' },
  fr: { flag: '🇫🇷', name: 'Français' },
  vn: { flag: '🇻🇳', name: 'Tiếng Việt' },
  in: { flag: '🇮🇳', name: 'हिन्दी' },
};

export const DEFAULT_LANGUAGE: LanguageKey = 'th';