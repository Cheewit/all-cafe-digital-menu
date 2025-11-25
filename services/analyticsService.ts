
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { LocationData, OmniContext, LanguageKey, CartItem, ProductGroup, Product } from '../types';
import { isPromotionActive } from './productService';
import { RATE_LIMIT_BUCKETS, DAILY_QUOTA_DEFAULT } from '../constants/config';

export interface AnalyticsContextData {
  sessionId: string | null;
  selectedLanguage: LanguageKey;
  browserLanguage: string | null;
  storeInfo: { zone: string | null; number: string | null; pos: string | null };
  location: LocationData | null;
  omniContext: OmniContext | null;
}

// --- Rate Limiting & Quotas ---

export const checkRateLimit = (sessionId: string, action: string): { ok: boolean; reason?: string } => {
  if (!sessionId) return { ok: true };
  const now = Date.now();
  const keyBase = `RL:${action}:${sessionId}`;

  for (const b of RATE_LIMIT_BUCKETS) {
    const key = `${keyBase}:${b.windowSec}`;
    const raw = localStorage.getItem(key);
    const timestamps = (raw ? JSON.parse(raw) : []) as number[];
    const validTimestamps = timestamps.filter(ts => now - ts < b.windowSec * 1000);

    if (validTimestamps.length >= b.limit) return { ok: false, reason: 'rateLimited' };
    
    validTimestamps.push(now);
    localStorage.setItem(key, JSON.stringify(validTimestamps));
  }
  return { ok: true };
};

export const checkDailyQuota = (sessionId: string, city: string, action: string, maxPerDay = DAILY_QUOTA_DEFAULT): { ok: boolean; reason?: string } => {
  if (!sessionId || !city) return { ok: true };
  const now = new Date();
  // Simple YYYYMMDD key
  const dateKey = now.toISOString().slice(0, 10).replace(/-/g, ''); 
  const key = `DQ:${action}:${sessionId}:${city}:${dateKey}`;
  
  const count = parseInt(localStorage.getItem(key) || '0', 10);
  if (count >= maxPerDay) return { ok: false, reason: 'dailyQuotaExceeded' };

  localStorage.setItem(key, (count + 1).toString());
  return { ok: true };
};

// --- Payload Construction ---

const getDateTime = () => {
  const now = new Date();
  const offset = 7 * 60 * 60 * 1000; // UTC+7
  const local = new Date(now.getTime() + offset);
  return {
    date: local.toISOString().split('T')[0],
    time: local.toISOString().split('T')[1].split('.')[0]
  };
};

const appendProductData = (fd: FormData, item: CartItem, group: ProductGroup, getTrans: (k: string) => string) => {
  const v = item.variant as Product;
  const noneTxt = getTrans('none');
  
  fd.append('Category', group.category || '');
  fd.append('Product_Code', v.Product_Code ? `'${v.Product_Code}'` : '');
  fd.append('Uniqcode', v.Uniqcode || '');
  fd.append('Name_TH', v.Name_TH || '');
  fd.append('Name_EN', v.Name_EN || '');
  fd.append('Type', v.Type || '');
  fd.append('Sizes', item.selectedSize || '');
  fd.append('Sweetness', item.selectedSweetness ? `${item.selectedSweetness}%` : noneTxt);
  fd.append('Add_ons', item.selectedAddons.length ? item.selectedAddons.map(a => `${a.name} (${a.price})`).join(', ') : noneTxt);
  fd.append('Price', item.customizedPrice.toString());
  fd.append('Quantity', (item.quantity || 1).toString());

  const isPromo = isPromotionActive(v) && !!v.Promotion_price;
  const discount = isPromo ? (parseFloat(v.Price) - parseFloat(String(v.Promotion_price))) : 0;
  
  fd.append('PromotionUsed', isPromo ? 'Yes' : 'No');
  fd.append('PromotionDiscount_Baht', discount > 0 ? discount.toFixed(2) : '0.00');
};

export const buildAnalyticsFormData = (
  action: string,
  ctx: AnalyticsContextData,
  data: Record<string, any>,
  getTrans: (k: string) => string
): FormData => {
  const fd = new FormData();
  const { date, time } = getDateTime();

  // Metadata
  fd.append('Date', date);
  fd.append('Time', time);
  // fd.append('Action', action); // Removed Action column
  fd.append('SessionId', ctx.sessionId || 'N/A');
  fd.append('LanguageAtEvent', ctx.selectedLanguage);
  fd.append('StoreNumber', ctx.storeInfo.number || '');
  fd.append('StoreZone', ctx.storeInfo.zone || '');
  fd.append('ApproxLocation', ctx.location?.city || 'Unknown');

  if (ctx.omniContext?.temp) {
      fd.append('TemperatureAtEvent_C', ctx.omniContext.temp.toFixed(1));
  }
  
  if (ctx.omniContext?.weather) {
      fd.append('WeatherCondition', ctx.omniContext.weather);
  }

  // Specific Logic
  if (data.aiFollowed) fd.append('AIRecommendationFollowed', data.aiFollowed);
  
  if (data.cartItem && data.productGroup) {
    appendProductData(fd, data.cartItem, data.productGroup, getTrans);
  }

  if (action === 'ORDER_CONFIRMED' && data.orderDurations) {
    // Split durations for deeper insight
    fd.append('TimeOnMenu_s', (data.orderDurations.menu / 1000).toFixed(2)); // Hesitation time
    fd.append('TimeOnCustomization_s', (data.orderDurations.customization / 1000).toFixed(2)); // Complexity time
    fd.append('TotalDuration_s', (data.orderDurations.total / 1000).toFixed(2));
  }

  if (data.feedback) {
    fd.append(data.feedback.type === 'like' ? 'Like' : 'Not Like', '1');
    fd.append('Improve', data.feedback.message || '');
  }

  return fd;
};

export const sendBeacon = (url: string, formData: FormData) => {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, formData);
    } else {
      fetch(url, { method: 'POST', body: formData, mode: 'no-cors' });
    }
  } catch (e) {
    console.error('Analytics transport failed', e);
  }
};
