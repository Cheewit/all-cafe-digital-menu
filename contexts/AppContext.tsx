
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Screen, LanguageKey, Product, ProductGroup, CartItem, Addon, OmniContext, AppTheme } from '../types';
import { LANGUAGES } from '../constants/languages';
import { TRANSLATIONS as APP_TRANS, SIZE_TRANSLATIONS as SIZE_TRANS } from '../constants/translations';

// Custom Hooks (Modular Architecture)
import { useSessionLogic } from '../hooks/useSessionLogic';
import { useProductLogic } from '../hooks/useProductLogic';
import { useAnalyticsLogic } from '../hooks/useAnalyticsLogic';
import { useCartLogic } from '../hooks/useCartLogic';

interface AppContextType {
  currentScreen: Screen;
  navigateTo: (screen: Screen, productGroup?: ProductGroup, initialType?: string) => void;
  isGeneratingQR: boolean;
  setIsGeneratingQR: (val: boolean) => void;
  
  selectedLanguage: LanguageKey;
  updateLanguage: (lang: LanguageKey) => void;
  getTranslation: (key: string, langOverride?: LanguageKey) => string;
  getSizeTranslation: (sizeKey: string, langOverride?: LanguageKey) => string;
  
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  isFestiveMode: boolean;
  setFestiveMode: (mode: boolean) => void;

  sessionId: string | null;
  omniContext: OmniContext | null;

  productsLoading: boolean;
  productsError: string | null;
  rawProducts: Product[];
  groupedProducts: ProductGroup[];
  highlightProductGroup: ProductGroup | null;
  fetchProducts: () => Promise<void>;
  
  aiRecommendation: ProductGroup | null;
  setAiRecommendation: (g: ProductGroup | null) => void;
  aiDecision: 'accepted' | 'ignored' | null;
  setAiDecision: (d: 'accepted' | 'ignored' | null) => void;
  outOfStockItems: Set<string>;
  markOutOfStock: (id: string) => void;
  markInStock: (id: string) => void;

  cart: CartItem[];
  addToCart: (variant: Product, group: ProductGroup, size: string, sweetness: string, addons: Addon[], unitPrice: number, quantity: number) => Promise<CartItem[]>;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  
  currentProductGroupForCustomization: ProductGroup | null;
  initialTypeForCustomization: string | null;
  logEvent: (action: string, data?: Record<string, any>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- 1. UI State ---
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>('default');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>(() => {
    if (typeof window === 'undefined') return 'en';
    const browser = navigator.language?.split('-')[0] as LanguageKey;
    return (LANGUAGES[browser] ? browser : 'en');
  });

  // --- 2. Logic Composition ---
  const getTranslation = useCallback((key: string, langOverride?: LanguageKey): string => {
    const lang = langOverride || selectedLanguage;
    const set = (APP_TRANS as any)[key];
    if (set && typeof set === 'object') return set[lang] ?? set['en'] ?? key;
    
    // Fallback for dynamic keys
    const lowerKey = key.toLowerCase();
    if ((APP_TRANS as any)[lowerKey]) return (APP_TRANS as any)[lowerKey][lang] ?? (APP_TRANS as any)[lowerKey]['en'] ?? key;
    return key;
  }, [selectedLanguage]);

  const getSizeTranslation = useCallback((key: string, langOverride?: LanguageKey) => {
    const lang = langOverride || selectedLanguage;
    return SIZE_TRANS[key]?.[lang] || SIZE_TRANS[key]?.en || key;
  }, [selectedLanguage]);

  // Initialize Sub-Modules
  const session = useSessionLogic();
  const analytics = useAnalyticsLogic(session, selectedLanguage, getTranslation);
  const products = useProductLogic(session.storeInfo.number, getTranslation);
  const cart = useCartLogic(products.groupedProducts, analytics.logEvent, products.setAiDecision);

  // --- 3. Navigation & Timers ---
  const [customizationState, setCustomizationState] = useState<{ group: ProductGroup | null, type: string | null }>({ group: null, type: null });
  const [screenTimes, setScreenTimes] = useState<{ menu: number | null, cust: number | null }>({ menu: null, cust: null });
  const [orderDurations, setOrderDurations] = useState<{ menu: number; customization: number; total: number } | null>(null);

  const navigateTo = useCallback((screen: Screen, group?: ProductGroup, type?: string) => {
    const now = Date.now();

    // AI Logic: Track decision when entering Customization
    if (currentScreen === Screen.Menu && screen === Screen.Customization && products.aiRecommendation && group) {
      if (products.aiDecision === null) {
        products.setAiDecision(group.id === products.aiRecommendation.id ? 'accepted' : 'ignored');
      }
    }

    // Timer Logic
    if (screen === Screen.Menu) {
      setScreenTimes({ menu: now, cust: null });
      setOrderDurations(null);
    } else if (screen === Screen.Customization) {
      setScreenTimes(prev => ({ ...prev, cust: now }));
    } else if (screen === Screen.Confirmation && screenTimes.menu) {
      setOrderDurations({
        menu: screenTimes.cust ? (screenTimes.cust - screenTimes.menu) : 0,
        customization: screenTimes.cust ? (now - screenTimes.cust) : 0,
        total: now - screenTimes.menu
      });
    }

    setIsGeneratingQR(screen === Screen.Confirmation);
    setCurrentScreen(screen);
    setCustomizationState({ group: group || null, type: type || null });
    window.scrollTo(0, 0);
  }, [currentScreen, screenTimes, products.aiRecommendation, products.aiDecision]);

  // Inject durations into analytics
  const enhancedLogEvent = useCallback(async (action: string, data: any = {}) => {
    const extra = (action === 'ORDER_CONFIRMED' && orderDurations) ? { orderDurations } : {};
    await analytics.logEvent(action, { ...data, ...extra });
  }, [analytics.logEvent, orderDurations]);

  return (
    <AppContext.Provider value={{
      currentScreen,
      navigateTo,
      isGeneratingQR,
      setIsGeneratingQR,
      selectedLanguage,
      updateLanguage: setSelectedLanguage,
      getTranslation,
      getSizeTranslation,
      appTheme,
      setAppTheme,
      
      // Modules
      ...session,
      ...products,
      ...cart,
      
      // Customization State
      currentProductGroupForCustomization: customizationState.group,
      initialTypeForCustomization: customizationState.type,
      logEvent: enhancedLogEvent,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
