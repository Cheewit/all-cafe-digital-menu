
export interface Order {
  [key:string]: string | number | null;
  "Timestamp": string;
  "Date": string;
  "Time": string; // Changed from "Time stamp"
  "SessionId": string;
  "LanguageAtEvent": string;
  "Category": string;
  "Brand": string; // New
  "Product_Code": string;
  "Uniqcode": string; // New
  "Name_TH": string;
  "Common_name_TH": string; // New
  "Name_EN": string;
  "Tags": string;
  "Type": string;
  "Add_ons": string;
  "Sizes": string;
  "Price": number | string;
  "Size_Prices": string;
  "Sweetness": string;
  "ApproxLocation": string;
  "BrowserLanguage": string; // New
  "Action": string; // New
  "Like": number | string;
  "Not_Like": number | string; // Changed from "Not Like"
  "Improve": string;
  "CustomizationDuration_s": number | string; // New
  "TotalDuration_s": number | string; // New
  "MenuDuration_s": number | string; // New
  "PromotionUsed": string;
  "PromotionName": string;
  "PromotionDiscount_Baht": number | string;
  "StoreZone": string;
  "StoreNumber": string;
  "Scanadslocation": string;
}

// Added for the new admin security log feature.
export interface LoginAttempt {
  timestamp: string;
  role: string;
  location: string;
  status: 'SUCCESS' | 'FAILED';
}

// Add UserRole type for clarity and type safety
export type UserRole = 'admin' | 'guest' | 'client';


// Fix: Add types for GeoJSON data for the ProvinceMap component.
export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: {
    [key: string]: any;
  };
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}
