import React from 'react';
import { Theme } from '../App';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  const buttonClass = (isActive: boolean) =>
    `rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ` +
    (isActive
      ? 'bg-slate-700 text-slate-100'
      : 'bg-transparent text-slate-400 hover:bg-slate-700/50');

  return (
    <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-lg">
      <button onClick={() => setTheme('dark')} className={buttonClass(theme === 'dark')} aria-pressed={theme === 'dark'}>
        Dark
      </button>
      <button onClick={() => setTheme('light')} className={buttonClass(theme === 'light')} aria-pressed={theme === 'light'}>
        Light
      </button>
    </div>
  );
};

export default ThemeSwitcher;