
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { LocationData, OmniContext } from '../types';
import { LOCATION_CACHE_KEY, LOCATION_TTL_MS } from '../constants/config';

export const generateSessionId = (): string => {
  return (typeof crypto !== 'undefined' && crypto.randomUUID) 
    ? crypto.randomUUID() 
    : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const parseStoreInfo = (params: URLSearchParams) => {
  const br = params.get('br');
  return {
    zone: br?.match(/^[a-zA-Z]+/)?.[0].toUpperCase() || null,
    number: br?.match(/\d+$/)?.[0] || null,
    pos: params.get('pos'),
  };
};

export const fetchLocation = async (): Promise<LocationData> => {
  const cached = sessionStorage.getItem(LOCATION_CACHE_KEY);
  if (cached) {
    const { value, ts } = JSON.parse(cached);
    if (Date.now() - ts < LOCATION_TTL_MS) return value;
  }

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('IPAPI failed');
    const data = await res.json();
    const loc = {
      city: `${data.city}, ${data.region}`,
      latitude: data.latitude,
      longitude: data.longitude
    };
    sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ value: loc, ts: Date.now() }));
    return loc;
  } catch {
    return { city: 'Unknown', latitude: null, longitude: null };
  }
};

export const getTimeOfDay = (): OmniContext['timeOfDay'] => {
  const hour = new Date().getHours(); // Simple local time for MVP
  if (hour < 5) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'late-night';
};

export const fetchWeather = async (lat: number, lon: number) => {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();
    return { weather: data.main || null, temp: data.temp || null };
  } catch (e) {
    console.warn('Weather fetch failed', e);
    return { weather: null, temp: null };
  }
};
