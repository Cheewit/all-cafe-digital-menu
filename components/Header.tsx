
import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { ActiveFilter, Theme } from '../App';
import { UserRole } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    dateRange?: DateRange;
    compareDateRange?: DateRange;
    activeFilter: ActiveFilter;
    onClearFilter: () => void;
    userRole: UserRole;
    client: string | null;
    onLogout: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const formatDateRange = (range?: DateRange, t?: any): string => {
    if (!range?.from) return t ? t('allTime') : "All Time";
    if (range.to && !isSameDay(range.from, range.to)) {
        return `${format(range.from, 'd MMM yyyy')} - ${format(range.to, 'd MMM yyyy')}`;
    }
    return format(range.from, 'd MMM yyyy');
}

const formatFilter = (filter: ActiveFilter, t: any): string => {
    if (!filter) return '';
    const typeLabel = filter.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `${t('filter')}: ${typeLabel} - ${filter.value}`;
}

const Header: React.FC<HeaderProps> = ({ dateRange, compareDateRange, activeFilter, onClearFilter, userRole, client, onLogout, theme, setTheme }) => {
    const { t } = useLanguage();
    const periodADisplay = formatDateRange(dateRange, t);
    const periodBDisplay = formatDateRange(compareDateRange, t);
    
    const clientWelcomeMessage: { [key: string]: string } = {
        'allcafe': `${t('welcome')}, ALL café Team`
    };

    const welcomeMessage = client ? clientWelcomeMessage[client] : null;
    const [isWelcomeVisible, setIsWelcomeVisible] = useState(!!welcomeMessage);

    useEffect(() => {
        if (welcomeMessage) {
            const timer = setTimeout(() => {
                setIsWelcomeVisible(false);
            }, 5000); // Message visible for 5 seconds
            return () => clearTimeout(timer);
        }
    }, [welcomeMessage]);

    return (
        <header>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[color:var(--text-color-primary)]">
                        BaristA:i Eyes
                    </h1>
                     {welcomeMessage && (
                        <div className="overflow-hidden">
                            <p className={`text-base font-semibold text-[color:var(--accent-color)] mt-2 transition-all duration-700 ease-out ${isWelcomeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
                               {welcomeMessage}
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-[color:var(--text-color-secondary)] mt-1 font-mono">
                        // {t('liveFeed')} &middot; 
                        {compareDateRange 
                            ? ` ${t('comparing')} [${periodADisplay}] ${t('vs')} [${periodBDisplay}]`
                            : ` ${t('showingDataFor')} ${periodADisplay}`
                        }
                    </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 self-start">
                     <div className="flex items-center gap-3">
                        {/* Control Group: Theme, User, then Language (Rightmost) */}
                        {userRole && (
                             <div className="flex items-center gap-2">
                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${userRole === 'admin' ? 'bg-cyan-900/70 text-cyan-300' : 'bg-slate-700/70 text-slate-300'}`}>
                                    {userRole.toUpperCase()}
                                </span>
                                <button onClick={onLogout} className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors">[{t('logout')}]</button>
                             </div>
                        )}
                        {userRole === 'client' && <ThemeSwitcher theme={theme} setTheme={setTheme} />}
                        <div className="ml-1 border-l border-slate-700 pl-2">
                            <LanguageSwitcher />
                        </div>
                     </div>
                    {activeFilter && (
                        <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
                             <span className="text-sm font-mono text-slate-300">{formatFilter(activeFilter, t)}</span>
                             <button
                                onClick={onClearFilter}
                                className="text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                                aria-label="Clear filter"
                            >
                                &times; {t('clear')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
