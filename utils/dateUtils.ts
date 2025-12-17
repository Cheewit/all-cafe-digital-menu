import { DateRange } from 'react-day-picker';
import { differenceInDays, getDate, getMonth, getDay, addDays, isWeekend, isSameDay, subDays } from 'date-fns';

export const calculatePreviousPeriod = (range?: DateRange): DateRange | undefined => {
  if (!range?.from) {
    return undefined; // Can't calculate for "All Time"
  }

  const from = range.from;
  const to = range.to || from; // If 'to' is not set, it's a single day

  const duration = differenceInDays(to, from) + 1;
  
  // Don't show trend for single day like "Today"
  if (duration <= 1) {
    return undefined;
  }

  const previousEnd = subDays(from, 1);
  const previousStart = subDays(previousEnd, duration - 1);

  return { from: previousStart, to: previousEnd };
};

// --- Logic for Office Context & Seasonality ---

export const isPaydayPeriod = (date: Date): boolean => {
    const d = getDate(date);
    // Payday range: 25th of previous month to 5th of current month
    return d >= 25 || d <= 5;
};

export const getThaiSeason = (date: Date): 'hot' | 'rainy' | 'cool' => {
    const month = getMonth(date); // 0-11
    if (month >= 2 && month <= 4) return 'hot'; // Mar, Apr, May
    if (month >= 5 && month <= 9) return 'rainy'; // Jun - Oct
    return 'cool'; // Nov - Feb
};

export const getWeatherImpact = (season: 'hot' | 'rainy' | 'cool'): { label: string; factor: number; icon: string } => {
    switch (season) {
        case 'hot': return { label: 'ฤดูร้อน (Hot)', factor: 1.15, icon: '☀️' }; // High demand for cold drinks
        case 'rainy': return { label: 'ฤดูฝน (Rainy)', factor: 0.90, icon: '🌧️' }; // Walk-in might drop
        case 'cool': return { label: 'ฤดูหนาว (Cool)', factor: 1.05, icon: '⛅' }; // Good atmosphere
    }
};

// Check for "Bridge Day" (e.g., Monday is working, but Tuesday is Holiday)
// In an office context, many people take leave on the bridge day.
export const isBridgeDay = (date: Date, holidays: { [key: string]: string }): boolean => {
    const day = getDay(date); // 0 Sun, 1 Mon ... 6 Sat
    
    // Case 1: Monday (1) is bridge if Tuesday (2) is Holiday
    if (day === 1) {
        const tuesday = addDays(date, 1);
        const tuesdayKey = tuesday.toISOString().split('T')[0];
        if (holidays[tuesdayKey]) return true;
    }

    // Case 2: Friday (5) is bridge if Thursday (4) is Holiday
    if (day === 5) {
        const thursday = addDays(date, -1);
        const thursdayKey = thursday.toISOString().split('T')[0];
        if (holidays[thursdayKey]) return true;
    }

    return false;
};