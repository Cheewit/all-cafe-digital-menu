
import React from 'react';
import { UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export type View = 'overview' | 'sales' | 'ux' | 'security';

interface ViewNavigatorProps {
  currentView: View;
  onViewChange: (view: View) => void;
  userRole: UserRole;
}

const ViewNavigator: React.FC<ViewNavigatorProps> = ({ currentView, onViewChange, userRole }) => {
  const { t } = useLanguage();

  const buttonClass = (isActive: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan ` +
    (isActive
      ? 'bg-slate-700/50 text-slate-100'
      : 'bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200');

  const ALL_VIEWS: { id: View; label: string; icon: React.ReactElement; adminOnly?: boolean }[] = [
    { 
        id: 'overview', 
        label: t('viewOverview'),
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    },
    { 
        id: 'sales', 
        label: t('viewSales'),
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    },
    { 
        id: 'ux', 
        label: t('viewUX'),
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    {
        id: 'security',
        label: t('viewSecurity'),
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.318-3.047a12.02 12.02 0 015.364-1.037l5.318 3.047A12.02 12.02 0 0021 12.059v-4.043a11.955 11.955 0 01-5.618-4.016z" /></svg>,
        adminOnly: true,
    }
  ];

  const visibleViews = ALL_VIEWS.filter(view => !view.adminOnly || userRole === 'admin');

  return (
    <div className="p-2 bg-slate-900/50 backdrop-blur-sm border border-cyan-400/10 rounded-xl flex items-center justify-start gap-2 overflow-x-auto">
      {visibleViews.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`${buttonClass(currentView === view.id)} whitespace-nowrap`}
          aria-current={currentView === view.id ? 'page' : undefined}
        >
          {view.icon}
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default ViewNavigator;
