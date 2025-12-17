// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG

export enum Screen {
  Welcome = 'WELCOME',
  Menu = 'MENU',
  Customization = 'CUSTOMIZATION',
  Cart = 'CART', 
  Confirmation = 'CONFIRMATION',
}

export type LanguageKey = 'th' | 'en' | 'jp' | 'zh' | 'kr' | 'my' | 'ru' | 'fr' | 'vn' | 'in';
export type AppTheme = 'default' | 'allselect';

export interface LanguageInfo {
  flag: string;
  name: string;
}

export interface Product {
  Product_Code?: string; 
  Uniqcode?: string; 
  Common_name_TH?: string; 
  Name_TH: string;
  Name_EN: string;
  Name_JP: string;
  Name_ZH: string;
  Name_KR: string;
  Name_MY: string;
  Name_RU: string;
  Name_FR: string;
  Name_VN: string;
  Name_IN: string;
  Category: string; 
  Type: string; 
  Price: string; 
  Sizes: string; 
  Tags: string; 
  Sweetness?: string; 
  // Addon_Options is a string containing a JSON array of Addon objects.
  // e.g., '[{"id": "A1", "name": "Pearl", "price": 10}, {"id": "A2", "name": "Jelly", "price": 15}]'
  Addon_Options?: string; 
  Image_URL: string; 
  Menu_startdate?: string;
  Menu_enddate?: string;
  Promotion_price?: string;
  Promotion_price_startdate?: string;
  Promotion_price_enddate?: string;
  special_day_conditions?: string;
  promotion_name?: string;
  Contain_Cowmilk?: string;
  special_conditon?: string; // For branch-specific menus
  Brand?: string;
  Description?: string;
  Descrpition?: string; // Typo support for specific database column
}

export interface ProductGroup {
  id: string; 
  nameKey: string; 
  category: string;
  variants: Product[];
  tags: string; 
  image: string;
  minPrice: number; // The lowest price to display (either promo or regular)
  originalMinPrice?: number; // The lowest regular price, if a promo is active
  brand?: string;
  description?: string;
  displayName: (lang: LanguageKey) => string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // Unique ID for each item in the cart
  productGroupId: string;
  variant: Product;
  quantity: number;
  selectedSize: string;
  selectedSweetness: string;
  selectedAddons: Addon[];
  customizedPrice: number;
}

export type Translations = {
  _meta?: {
    author: string;
    github: string;
    version: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allows for nested structure or direct lang key mapping
};

export type SizeTranslation = {
  [sizeKey: string]: { [key in LanguageKey]?: string } & { en: string }; // 'en' is mandatory fallback
};

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

// Types for BaristA:i Sense Engine™
export interface LocationData {
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export interface OmniContext {
  weather: string | null;
  temp: number | null;
  timeOfDay: 'night' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'late-night' | null;
}