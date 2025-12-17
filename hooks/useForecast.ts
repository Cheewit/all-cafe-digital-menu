import { useMemo } from 'react';
import { Order } from '../types';
import { getRowDateTime, get } from '../utils/dataUtils';
import { resolveProvinceName } from '../utils/provinceResolver';
import { format, addDays, isWeekend, startOfToday, subWeeks } from 'date-fns';
import { isPaydayPeriod, getThaiSeason, getWeatherImpact, isBridgeDay } from '../utils/dateUtils';

// --- CONFIGURATION ---
const WEEKS_TO_CONSIDER_FOR_FORECAST = 8;

export interface ForecastDay {
    date: string;
    day: string;
    forecast: number;
    factors: string[]; // List of reasons e.g., "Holiday", "Payday", "Bridge Day"
    impactLevel: 'positive' | 'negative' | 'neutral';
    weatherIcon: string;
}

export const useForecast = (
  rows: Order[], 
  product: string | 'all', 
  province: string | 'all',
  holidays: { [key: string]: string } // Receive holidays map
) => {
  return useMemo(() => {
    const forecastStartDate = subWeeks(startOfToday(), WEEKS_TO_CONSIDER_FOR_FORECAST);

    // 1. Filter historical data
    const recentRows = rows.filter(row => {
        const date = getRowDateTime(row);
        return date ? date >= forecastStartDate : false;
    });

    if (recentRows.length === 0) {
      return { forecast: [], peakDay: null, highDemandAlert: false };
    }

    const filteredRows = recentRows.filter(row => {
      const rowProduct = String(get(row, 'commonNameTH') || get(row, 'nameTH') || '').trim();
      const rowProvince = resolveProvinceName(get(row, 'approxLocation'));
      const productMatch = product === 'all' || rowProduct === product;
      const provinceMatch = province === 'all' || rowProvince === province;
      return productMatch && provinceMatch;
    });

    // 2. Calculate "Base Baseline" per Day of Week (0-6)
    const salesPerDay: { [key: string]: number[] } = {
      'Sun': [], 'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': []
    };

    // Group counts by date first to get daily totals
    const dailyCounts: { [date: string]: number } = {};
    for (const row of filteredRows) {
        const date = getRowDateTime(row);
        if (date) {
            const dateKey = format(date, 'yyyy-MM-dd');
            dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
        }
    }

    // Populate arrays
    for (const [dateStr, count] of Object.entries(dailyCounts)) {
        const date = new Date(dateStr);
        const dayName = format(date, 'EEE');
        // Exclude past holidays from the "Base" calculation to avoid skewing the average down
        // We want a "Normal Day Average"
        if (!holidays[dateStr]) {
            salesPerDay[dayName].push(count);
        }
    }

    const avgSalesByDayOfWeek: { [key: string]: number } = {};
    for (const day in salesPerDay) {
        const counts = salesPerDay[day];
        if (counts.length > 0) {
            // Use Median or Average? Average is fine for now.
            const total = counts.reduce((sum, c) => sum + c, 0);
            avgSalesByDayOfWeek[day] = total / counts.length;
        } else {
            avgSalesByDayOfWeek[day] = 0;
        }
    }

    // 3. Generate Forecast for Next 7 Days with "Office Worker Factors"
    const today = startOfToday();
    const forecast: ForecastDay[] = Array.from({ length: 7 }, (_, i) => {
      const targetDate = addDays(today, i + 1);
      const dayOfWeek = format(targetDate, 'EEE');
      const dateKey = format(targetDate, 'yyyy-MM-dd');
      
      let baseForecast = avgSalesByDayOfWeek[dayOfWeek] || 0;
      const factors: string[] = [];
      let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

      // --- FACTOR 1: Holidays (Office Closed) ---
      if (holidays[dateKey]) {
          // Office assumption: Holidays kill sales. Reduce by 80%.
          baseForecast *= 0.2; 
          factors.push(`🛑 วันหยุด: ${holidays[dateKey]}`);
          impact = 'negative';
      } 
      // --- FACTOR 2: Bridge Days (Long Weekend Effect) ---
      else if (isBridgeDay(targetDate, holidays)) {
          // Many people take leave. Reduce by 40%.
          baseForecast *= 0.6;
          factors.push("📉 วันฟันหลอ (คนลางาน)");
          impact = 'negative';
      }
      // --- FACTOR 3: Payday (Office Rich) ---
      else if (isPaydayPeriod(targetDate)) {
          // Payday week! Increase by 20%.
          baseForecast *= 1.2;
          factors.push("💰 สัปดาห์เงินเดือนออก");
          impact = 'positive';
      }

      // --- FACTOR 4: Weather/Season ---
      const season = getThaiSeason(targetDate);
      const weatherInfo = getWeatherImpact(season);
      baseForecast *= weatherInfo.factor;
      
      // Only add weather factor if it's significant (Hot or Rainy)
      if (season !== 'cool') {
          factors.push(`${weatherInfo.icon} ${weatherInfo.label}`);
      }

      // --- FACTOR 5: Weekend (Office Closed) ---
      // If base data already includes weekends, it handles itself.
      // But if we want to be explicit about why it's low:
      if (isWeekend(targetDate) && !holidays[dateKey]) {
           // factors.push("🏖️ วันหยุดสุดสัปดาห์"); // Optional
      }

      return {
        date: dateKey,
        day: dayOfWeek,
        forecast: Math.round(baseForecast),
        factors,
        impactLevel: impact,
        weatherIcon: weatherInfo.icon
      };
    });
    
    // 4. Find peak and alert
    let peakDay = null;
    if (forecast.length > 0) {
        peakDay = forecast.reduce((max, day) => day.forecast > max.forecast ? day : max, forecast[0]);
    }

    const highDemandAlert = forecast.some(day => day.forecast >= 100);

    return { forecast, peakDay, highDemandAlert };

  }, [rows, product, province, holidays]);
};