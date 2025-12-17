
import { useMemo } from 'react';
import { Order } from '../types';
import { get, parseNumber, getRowDateTime } from '../utils/dataUtils';
import { resolveProvinceName } from '../utils/provinceResolver';
import { format, differenceInDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { normalizeLang } from '../utils/languageUtils';

const calculateAggregates = (rows: Order[], dateRange?: DateRange) => {
  const emptyAggregates = {
      totalOrders: 0,
      sales: 0,
      totalUnits: 0,
      avgDailySales: 0,
      avgDailyUnits: 0,
      avgOrderValue: 0,
      likeRate: 0,
      notLikeRate: 0,
      byHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
      byDayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({ day, count: 0 })),
      byDate: [],
      byProvince: {},
      byLanguage: [],
      topProducts: [],
      byCategory: [],
      byBrand: [], // New
      bySweetness: [],
      avgMenuDuration: 0,
      avgCustomizationDuration: 0,
      avgTotalDuration: 0,
      latestFeedback: [],
      byAction: [],
      byBrowserLanguage: [],
      totalDiscount: 0,
      promotionUsageRate: 0,
      byPromotion: [],
      byStoreZone: [],
      byScanLocation: [],
  };

  if (!rows || rows.length === 0) {
    return emptyAggregates;
  }

  let sales = 0;
  let totalLikes = 0;
  let totalNotLikes = 0;
  const byHour: { [key: number]: number } = {};
  const byDayOfWeek: { [key: string]: number } = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const byDate: { [key: string]: number } = {};
  const byProvince: { [key: string]: number } = {};
  const byLanguage: { [key: string]: number } = {};
  const topProducts: { [key: string]: { count: number; sales: number } } = {};
  const byCategory: { [key: string]: { count: number; sales: number } } = {};
  const byBrand: { [key: string]: { count: number; sales: number } } = {}; // New
  const bySweetness: { [key: string]: number } = {};
  const latestFeedback: string[] = [];
  const byAction: { [key: string]: number } = {};
  const byBrowserLanguage: { [key: string]: number } = {};
  let totalDiscount = 0;
  let promotionOrders = 0;
  const byPromotion: { [key: string]: { count: number; totalDiscount: number; totalSales: number } } = {};
  const byStoreZone: { [key: string]: number } = {};
  const byScanLocation: { [key: string]: number } = {};

  let totalMenuDuration = 0;
  let menuDurationCount = 0;
  let totalCustomizationDuration = 0;
  let customizationDurationCount = 0;
  let totalTotalDuration = 0;
  let totalDurationCount = 0;

  for (const row of rows) {
    const price = parseNumber(get(row, 'price')) || 0;
    sales += price;

    if (parseNumber(get(row, 'like')) === 1) totalLikes++;
    if (parseNumber(get(row, 'notLike')) === 1) totalNotLikes++;
    const feedback = String(get(row, 'improve') || '').trim();
    if (feedback) {
      latestFeedback.unshift(feedback);
    }
    
    const date = getRowDateTime(row);

    if (date) {
        const hour = date.getHours();
        byHour[hour] = (byHour[hour] || 0) + 1;

        const dayOfWeek = format(date, 'EEE');
        if(byDayOfWeek.hasOwnProperty(dayOfWeek)) {
            byDayOfWeek[dayOfWeek]++;
        }

        const dateKey = format(date, 'yyyy-MM-dd');
        byDate[dateKey] = (byDate[dateKey] || 0) + 1;
    }

    const locationString = get(row, 'approxLocation');
    const province = resolveProvinceName(locationString) || 'ไม่ทราบจังหวัด';
    byProvince[province] = (byProvince[province] || 0) + 1;

    const lang = normalizeLang(get(row, 'language') as string);
    byLanguage[lang] = (byLanguage[lang] || 0) + 1;

    const productName = String(get(row, 'commonNameTH') || get(row, 'nameTH') || 'Unknown').trim();
    if (productName !== 'Unknown') {
        if (!topProducts[productName]) topProducts[productName] = { count: 0, sales: 0 };
        topProducts[productName].count++;
        topProducts[productName].sales += price;
    }

    const category = String(get(row, 'category') || 'Unknown').trim();
    if (category !== 'Unknown') {
        if (!byCategory[category]) byCategory[category] = { count: 0, sales: 0 };
        byCategory[category].count++;
        byCategory[category].sales += price;
    }
    
    // New Brand aggregation
    const brand = String(get(row, 'brand') || 'Unknown').trim();
    if (brand !== 'Unknown') {
        if (!byBrand[brand]) byBrand[brand] = { count: 0, sales: 0 };
        byBrand[brand].count++;
        byBrand[brand].sales += price;
    }

    const sweetness = String(get(row, 'sweetness') || 'N/A').trim();
    if (sweetness !== 'N/A') {
        bySweetness[sweetness] = (bySweetness[sweetness] || 0) + 1;
    }
    
    const action = String(get(row, 'action') || 'N/A').trim();
    if(action !== 'N/A') {
        byAction[action] = (byAction[action] || 0) + 1;
    }

    const browserLang = String(get(row, 'browserLanguage') || 'Unknown').trim();
    if(browserLang !== 'Unknown' && browserLang !== '') {
        byBrowserLanguage[browserLang] = (byBrowserLanguage[browserLang] || 0) + 1;
    }

    const menuDuration = parseNumber(get(row, 'menuDuration'));
    if (menuDuration !== null) {
        totalMenuDuration += menuDuration;
        menuDurationCount++;
    }
    const customizationDuration = parseNumber(get(row, 'customizationDuration'));
    if (customizationDuration !== null) {
        totalCustomizationDuration += customizationDuration;
        customizationDurationCount++;
    }
    const totalDuration = parseNumber(get(row, 'totalDuration'));
    if (totalDuration !== null) {
        totalTotalDuration += totalDuration;
        totalDurationCount++;
    }

    const discount = parseNumber(get(row, 'promotionDiscount')) || 0;
    totalDiscount += discount;

    const promoUsed = String(get(row, 'promotionUsed') || 'N').trim().toUpperCase();
    if (promoUsed === 'Y' || promoUsed === 'TRUE' || discount > 0) {
        promotionOrders++;
        const promoName = String(get(row, 'promotionName') || 'Unknown Promotion').trim();
        if (promoName && promoName !== 'Unknown Promotion' && promoName !== 'N/A') {
            if (!byPromotion[promoName]) byPromotion[promoName] = { count: 0, totalDiscount: 0, totalSales: 0 };
            byPromotion[promoName].count++;
            byPromotion[promoName].totalDiscount += discount;
            byPromotion[promoName].totalSales += price;
        }
    }
    
    const storeZone = String(get(row, 'storeZone') || 'N/A').trim();
    if (storeZone !== 'N/A' && storeZone !== '') {
        byStoreZone[storeZone] = (byStoreZone[storeZone] || 0) + 1;
    }

    const scanLocation = String(get(row, 'scanLocation') || 'N/A').trim();
    if (scanLocation !== 'N/A' && scanLocation !== '') {
        byScanLocation[scanLocation] = (byScanLocation[scanLocation] || 0) + 1;
    }
  }

  const totalOrders = rows.length;
  const likeRate = totalOrders > 0 ? Math.round((totalLikes / totalOrders) * 100) : 0;
  const notLikeRate = totalOrders > 0 ? Math.round((totalNotLikes / totalOrders) * 100) : 0;
  
  // New Sales KPIs
  const totalUnits = totalOrders;
  const avgOrderValue = totalOrders > 0 ? sales / totalOrders : 0;
  const promotionUsageRate = totalOrders > 0 ? Math.round((promotionOrders / totalOrders) * 100) : 0;


  let avgDailySales = 0;
  let avgDailyUnits = 0;
  if (dateRange?.from) {
      const to = dateRange.to || dateRange.from;
      const days = differenceInDays(to, dateRange.from) + 1;
      if (days > 0) {
          avgDailySales = sales / days;
          avgDailyUnits = totalUnits / days;
      }
  }

  return {
    totalOrders,
    sales,
    totalUnits,
    avgDailySales,
    avgDailyUnits,
    avgOrderValue,
    likeRate,
    notLikeRate,
    byHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: byHour[i] || 0 })),
    byDayOfWeek: Object.entries(byDayOfWeek).map(([day, count]) => ({ day, count })),
    byDate: Object.entries(byDate).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date)),
    byProvince,
    byLanguage: Object.entries(byLanguage).map(([language, count]) => ({ language, count })),
    topProducts: Object.entries(topProducts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    byCategory: Object.entries(byCategory)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.sales - a.sales),
    byBrand: Object.entries(byBrand)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.sales - a.sales),
    bySweetness: Object.entries(bySweetness).map(([level, count]) => ({ level, count })),
    avgMenuDuration: menuDurationCount > 0 ? Math.round(totalMenuDuration / menuDurationCount) : 0,
    avgCustomizationDuration: customizationDurationCount > 0 ? Math.round(totalCustomizationDuration / customizationDurationCount) : 0,
    avgTotalDuration: totalDurationCount > 0 ? Math.round(totalTotalDuration / totalDurationCount) : 0,
    latestFeedback: latestFeedback.slice(0, 5),
    byAction: Object.entries(byAction).map(([name, count]) => ({ name, count })),
    byBrowserLanguage: Object.entries(byBrowserLanguage).map(([language, count]) => ({ language, count })),
    promotionUsageRate,
    totalDiscount,
    byPromotion: Object.entries(byPromotion)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count),
    byStoreZone: Object.entries(byStoreZone)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    byScanLocation: Object.entries(byScanLocation)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
  };
};

export const useAggregates = (rows: Order[], dateRange?: DateRange) => {
  return useMemo(() => calculateAggregates(rows, dateRange), [rows, dateRange]);
};
