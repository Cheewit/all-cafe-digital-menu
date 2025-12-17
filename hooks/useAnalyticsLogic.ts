
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { useCallback } from 'react';
import { LanguageKey } from '../types';
import { useToast } from '../contexts/ToastContext';
import { checkRateLimit, checkDailyQuota, buildAnalyticsFormData, sendBeacon } from '../services/analyticsService';
import { useSessionLogic } from './useSessionLogic';
import { ORDER_ANALYTICS_API_URL } from '../constants/app';

export const useAnalyticsLogic = (
  session: ReturnType<typeof useSessionLogic>,
  lang: LanguageKey,
  getTrans: (k: string) => string
) => {
  const { showToast } = useToast();
  const { sessionId, location } = session;

  const logEvent = useCallback(async (action: string, data: Record<string, any> = {}) => {
    if (!sessionId) return;

    // Guards
    const rl = checkRateLimit(sessionId, action);
    if (!rl.ok) { showToast(getTrans(rl.reason!), 'error'); return; }

    if (location?.city) {
      const dq = checkDailyQuota(sessionId, location.city, action);
      if (!dq.ok) { showToast(getTrans(dq.reason!), 'error'); return; }
    }

    // Build & Send
    const ctx = { 
      sessionId, 
      selectedLanguage: lang, 
      browserLanguage: session.browserLanguage,
      storeInfo: session.storeInfo, 
      location, 
      omniContext: session.omniContext 
    };
    
    const formData = buildAnalyticsFormData(action, ctx, data, getTrans);
    sendBeacon(ORDER_ANALYTICS_API_URL, formData);

  }, [sessionId, location, lang, session, getTrans, showToast]);

  return { logEvent };
};
