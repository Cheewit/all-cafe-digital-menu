
export const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxzNF_6OLV04UoShPzmjaOW4Bc0e0WJhui6GQM2KW058a1-2CWJhA2pXw5HNjYekxqgrQ/exec";

// Fix: Add GEOJSON_URL for the ProvinceMap component.
export const GEOJSON_URL = 'https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json';

// --- New constants for enhanced diagnostics ---
// TODO: Replace with your actual Web Menu URL
export const WEB_MENU_URL = "https://all-cafe-digital-menu-42n3.vercel.app/"; 
// This endpoint is now live with the user's provided URL.
export const MENU_SHEET_API_ENDPOINT = "https://script.google.com/macros/s/AKfycbypg-d0Hs9aSDwb8LAsDKjPGWGLgZOiuy-V3JJgIzBkQ6Imba3WRXuQcfX4lXqvVxK7ng/exec"; 
// Direct link to the Google Sheet for the menu database
export const MENU_SHEET_URL = "https://docs.google.com/spreadsheets/d/1oo0pnY6cObgVIX-obCjp6QNYDKyOraUfCc5AojcQfMo/edit?gid=0#gid=0";


export const POLLING_OPTIONS = [
  { value: 10000, label: '10 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' },
];
export const DEFAULT_POLL_MS = 300000; // Default to 5 minutes

export const columnMapping: { [key: string]: string } = {
  timestamp: "Timestamp",
  date: "Date",
  time: "Time",
  sessionId: "SessionId",
  language: "LanguageAtEvent",
  category: "Category",
  brand: "Brand",
  productCode: "Product_Code",
  uniqcode: "Uniqcode",
  nameTH: "Name_TH",
  commonNameTH: "Common_name_TH",
  nameEN: "Name_EN",
  tags: "Tags",
  type: "Type",
  addons: "Add_ons",
  sizes: "Sizes",
  price: "Price",
  sizePrices: "Size_Prices",
  sweetness: "Sweetness",
  approxLocation: "ApproxLocation",
  browserLanguage: "BrowserLanguage",
  action: "Action",
  like: "Like",
  notLike: "Not_Like",
  improve: "Improve",
  customizationDuration: "CustomizationDuration_s",
  totalDuration: "TotalDuration_s",
  menuDuration: "MenuDuration_s",
  promotionUsed: "PromotionUsed",
  promotionName: "PromotionName",
  promotionDiscount: "PromotionDiscount_Baht",
  storeZone: "StoreZone",
  storeNumber: "StoreNumber",
  scanLocation: "Scanadslocation",
};
