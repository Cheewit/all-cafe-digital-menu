
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { useState, useEffect } from 'react';
import { LocationData, OmniContext } from '../types';
import * as Service from '../services/sessionService';

export const useSessionLogic = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [storeInfo, setStoreInfo] = useState({ zone: null as string|null, number: null as string|null, pos: null as string|null });
  const [omniContext, setOmniContext] = useState<OmniContext | null>(null);
  const [isFestiveMode, setIsFestiveMode] = useState(false);
  const [browserLanguage, setBrowserLanguage] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(Service.generateSessionId());
    if (typeof navigator !== 'undefined') setBrowserLanguage(navigator.language);

    const params = new URLSearchParams(window.location.search);
    setStoreInfo(Service.parseStoreInfo(params));

    // Festive Logic
    const today = new Date();
    // Range: Dec 1, 2025 - Jan 1, 2026
    const isDec2025 = today.getFullYear() === 2025 && today.getMonth() === 11;
    const isJan1_2026 = today.getFullYear() === 2026 && today.getMonth() === 0 && today.getDate() === 1;

    const isXmasTime = isDec2025 || isJan1_2026;
    
    if (isXmasTime || params.get('mode') === 'xmas') setIsFestiveMode(true);

    // Location & Environment
    Service.fetchLocation().then(loc => {
      setLocation(loc);
      if (loc.latitude && loc.longitude) {
        Service.fetchWeather(loc.latitude, loc.longitude).then(w => {
          setOmniContext({ ...w, timeOfDay: Service.getTimeOfDay() });
        });
      } else {
        setOmniContext({ weather: null, temp: null, timeOfDay: Service.getTimeOfDay() });
      }
    });
  }, []);

  return { sessionId, location, storeInfo, omniContext, isFestiveMode, setFestiveMode: setIsFestiveMode, browserLanguage };
};
