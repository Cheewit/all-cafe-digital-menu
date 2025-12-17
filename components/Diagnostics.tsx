import React, { useState, useEffect, useCallback } from 'react';
import { GAS_ENDPOINT, WEB_MENU_URL, MENU_SHEET_API_ENDPOINT, MENU_SHEET_URL } from '../constants';
import { fetchJSON } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const StatusBadge: React.FC<{ status: boolean | null, text: string, url: string, t: any }> = ({ status, text, url, t }) => {
    const bgColor = status === true ? 'bg-green-900/50 text-green-300' : status === false ? 'bg-red-900/50 text-red-300' : 'bg-slate-700/50 text-slate-300';
    const dotColor = status === true ? 'bg-green-400' : status === false ? 'bg-red-400' : 'bg-slate-400';
    const statusText = status === true ? t('online') : status === false ? t('error') : t('pinging');

    return (
        <div className="flex items-center justify-between">
            <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-400 hover:text-accent-cyan underline decoration-dotted underline-offset-2 transition-colors">
                {text}
            </a>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${bgColor}`}>
                <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${dotColor}`} fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                </svg>
                {statusText}
            </span>
        </div>
    );
};


const Diagnostics: React.FC = () => {
  const [gasStatus, setGasStatus] = useState<boolean | null>(null);
  const [webMenuStatus, setWebMenuStatus] = useState<boolean | null>(null);
  const [menuSheetStatus, setMenuSheetStatus] = useState<boolean | null>(null);
  const { t } = useLanguage();

  const [testing, setTesting] = useState<boolean>(false);

  const runTests = useCallback(async () => {
    setTesting(true);
    setGasStatus(null);
    setWebMenuStatus(null);
    setMenuSheetStatus(null);
    
    // Check Order Sheet API
    try {
      const gasData = await fetchJSON<{ rows?: any[]; data?: any[] }>(`${GAS_ENDPOINT}?sheet=OrderAnalytics`, { timeoutMs: 12000 });
      setGasStatus(Array.isArray(gasData.rows || gasData.data));
    } catch (e) {
      setGasStatus(false);
    }

    // Check Web Menu URL (basic reachability)
    try {
      await fetch(WEB_MENU_URL, { mode: 'no-cors', timeout: 8000 } as RequestInit);
      setWebMenuStatus(true);
    } catch (e) {
      setWebMenuStatus(false);
    }

    // Check Menu Sheet API
    try {
      const menuData = await fetchJSON<{ ok?: boolean }>(`${MENU_SHEET_API_ENDPOINT}?sheet=MenuItems`, { timeoutMs: 12000 });
      setMenuSheetStatus(menuData.ok === true);
    } catch (e) {
      setMenuSheetStatus(false);
    }

    setTesting(false);
  }, []);

  useEffect(() => {
    runTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 h-full">
      <h3 className="font-semibold text-sm text-slate-300 mb-3">{t('systemDiagnostics')}</h3>
      <div className="space-y-3 text-xs">
        <StatusBadge status={gasStatus} text={t('orderSheetAPI')} url={GAS_ENDPOINT} t={t} />
        <StatusBadge status={webMenuStatus} text={t('webMenu')} url={WEB_MENU_URL} t={t} />
        <StatusBadge status={menuSheetStatus} text={t('menuSheetAPI')} url={MENU_SHEET_URL} t={t} />
      </div>
      <div className="mt-4">
        <button 
          onClick={runTests} 
          disabled={testing}
          className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan"
        >
          {testing ? t('pinging') : t('reRunTests')}
        </button>
      </div>
    </div>
  );
};

export default Diagnostics;