// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { Product, ProductGroup, LanguageKey } from '../types';
import { MENU_KNOWLEDGE_BASE, MenuKnowledge } from '../constants/menuKnowledgeBase';

/**
 * Parses a date string in various formats (DD/MM/YYYY, ISO 8601) into a Date object (UTC, time zeroed out).
 * @param dateString The date string to parse.
 * @returns A Date object or null if the format is invalid.
 */
const parseDate = (dateString?: string): Date | null => {
    if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') return null;

    // Try parsing DD/MM/YYYY first, as requested by the user for input.
    const dmyParts = dateString.split('/');
    if (dmyParts.length === 3) {
        const day = parseInt(dmyParts[0], 10);
        const month = parseInt(dmyParts[1], 10) - 1; // JS months are 0-indexed
        const year = parseInt(dmyParts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1000) {
            return new Date(Date.UTC(year, month, day));
        }
    }

    // Then, try parsing as ISO 8601 or other formats recognized by the Date constructor.
    // This will handle formats from Google Sheets like '2025-10-15T17:00:00.000Z'.
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        // To ensure we compare dates only, create a new date with its time part zeroed out in UTC.
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
    
    // Log a warning if a date string was provided but couldn't be parsed.
    console.warn(`Could not parse date format. Received: '${dateString}'`);
    return null; // Return null if parsing fails for all known formats.
};


/**
 * Checks if the current date (in GMT+7) is within a specified date range.
 * Handles open-ended ranges (only start or only end date).
 * @param startDateStr The start date string.
 * @param endDateStr The end date string.
 * @returns True if the current date is within the range.
 */
export const isDateInRange = (startDateStr?: string, endDateStr?: string): boolean => {
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    // If neither date is valid/provided, it's a permanent item, so it's always in range.
    if (!startDate && !endDate) {
        return true;
    }
    
    try {
        const now = new Date();
        const gmtPlus7Time = new Date(now.valueOf() + 7 * 60 * 60 * 1000);
        // Get today's date with time zeroed out for a clean comparison.
        const today = new Date(Date.UTC(gmtPlus7Time.getUTCFullYear(), gmtPlus7Time.getUTCMonth(), gmtPlus7Time.getUTCDate()));

        // Check if today is on or after the start date (if a start date exists).
        const isAfterStart = startDate ? today.getTime() >= startDate.getTime() : true;

        // Check if today is on or before the end date (if an end date exists).
        const isBeforeEnd = endDate ? today.getTime() <= endDate.getTime() : true;

        return isAfterStart && isBeforeEnd;

    } catch(e) {
        console.error("Error during date range comparison:", e);
        return true; // Fail open if there's an unexpected error
    }
};


/**
 * Gets the current day of the week in GMT+7 as a three-letter string (e.g., 'Mon').
 * @returns The current day of the week.
 */
const getCurrentDayGMTPlus7 = (): string => {
    const now = new Date();
    const gmtPlus7Time = new Date(now.valueOf() + 7 * 60 * 60 * 1000);
    const dayIndex = gmtPlus7Time.getUTCDay(); // Sunday = 0, Monday = 1, etc.
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
};

/**
 * Checks if a promotion is active based on date range and specific day conditions.
 * @param product The product to check.
 * @returns True if the promotion is currently active.
 */
export const isPromotionActive = (product: Product): boolean => {
    // A promotion requires a promotion price to exist.
    // The value might come as a number from the API, so we ensure it's a string before trimming.
    if (!product.Promotion_price || String(product.Promotion_price).trim() === '') {
        return false;
    }

    // 1. Check if the base date range is valid.
    const dateIsInRange = isDateInRange(product.Promotion_price_startdate, product.Promotion_price_enddate);
    if (!dateIsInRange) {
        return false;
    }

    // 2. If date is in range, check for special day conditions.
    const specialDays = product.special_day_conditions;
    if (!specialDays || specialDays.trim() === '') {
        // No day conditions, so promotion is active based on date alone.
        return true;
    }

    // 3. If there are special day conditions, check if today is one of them.
    const allowedDays = specialDays.split(',').map(day => day.trim().toLowerCase());
    const currentDay = getCurrentDayGMTPlus7().toLowerCase();
    
    return allowedDays.includes(currentDay);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAllProducts = async (apiUrl: string, storeNumber: string | null, retries = 3, delay = 1000): Promise<Product[]> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(apiUrl, { cache: 'no-store' });
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to fetch products: HTTP ${response.status} ${response.statusText}. Response: ${responseText.slice(0, 200)}`);
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Failed to parse product data as JSON. Response: ${responseText.slice(0, 200)}`);
      }
      
      if (!Array.isArray(data)) {
        throw new Error(`Invalid product data format: Expected an array, but got ${typeof data}.`);
      }
      
      const products: Product[] = data;
      
      const availableProducts = products.filter(product => {
          const isActiveDate = isDateInRange(product.Menu_startdate, product.Menu_enddate);
          
          // Strict filtering: Hide products with incomplete data (Missing Price or Missing Image)
          const hasPrice = product.Price && String(product.Price).trim() !== '';
          const hasImage = product.Image_URL && product.Image_URL.trim() !== '';
          
          return isActiveDate && hasPrice && hasImage;
      });
      
      // NEW LOGIC: If a store number is present, filter out products meant to be hidden at this store.
      if (storeNumber) {
        return availableProducts.filter(product => {
          const hiddenAtBranches = product.special_conditon?.split(',').map(s => s.trim()) || [];
          // Keep the product only if the current store number is NOT in its exclusion list.
          return !hiddenAtBranches.includes(storeNumber);
        });
      }

      // If no store number is provided (general access), show all available products.
      return availableProducts;

    } catch (error) {
      console.error(`Fetch attempt ${i + 1} of ${retries} failed:`, error);
      if (i === retries - 1) { // If it's the last attempt
        throw error; // Re-throw the last error
      }
      // Use a simple delay instead of exponential backoff for this case
      await sleep(delay); 
    }
  }
  // This line is technically unreachable if retries > 0, but required by TypeScript
  throw new Error('Failed to fetch products after multiple retries.');
};


export const groupProductsUtil = (products: Product[]): { grouped: ProductGroup[], highlight: ProductGroup | null } => {
  const groups: { [key: string]: ProductGroup } = {};
  let highlight: ProductGroup | null = null;

  products.forEach(product => {
    const conceptualNameBase = product.Common_name_TH || product.Name_EN; 
    const categoryKey = product.Category;
    
    // Use Brand in grouping key to separate identical items from different brands (e.g. All Cafe vs All Select)
    const brandKey = product.Brand || '';
    const groupKey = `${brandKey}_${conceptualNameBase}_${categoryKey}`; 
    
    // Normalize description: check both Description and Descrpition (typo)
    const desc = product.Description || product.Descrpition || '';

    if (!groups[groupKey]) {
      groups[groupKey] = {
        id: groupKey,
        nameKey: conceptualNameBase, 
        category: categoryKey,
        variants: [],
        tags: product.Tags || '',
        image: product.Image_URL || '',
        minPrice: Infinity,
        originalMinPrice: Infinity,
        brand: product.Brand,
        description: desc,
        displayName: (lang: LanguageKey) => {
            if (lang === 'th') {
                return product.Common_name_TH || product.Name_TH || product.Name_EN;
            }
            const langSpecificNameKey = `Name_${lang.toUpperCase() as 'EN' | 'JP' | 'ZH' | 'KR' | 'MY' | 'RU' | 'FR' | 'VN' | 'IN'}` as keyof Product;
            const langSpecificName = product[langSpecificNameKey] as string | undefined;
            return langSpecificName || product.Name_EN;
        }
      };
    }
    groups[groupKey].variants.push(product);
    if (product.Image_URL && !groups[groupKey].image) {
        groups[groupKey].image = product.Image_URL;
    }
    // If the group description is empty but this product has one, use it.
    if (!groups[groupKey].description && desc) {
        groups[groupKey].description = desc;
    }
  });

  const groupedArray = Object.values(groups).map(group => {
    group.variants.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
    
    let lowestPrice = Infinity;
    let lowestOriginalPrice = Infinity;

    group.variants.forEach(variant => {
        const regularPrice = parseFloat(variant.Price);
        lowestOriginalPrice = Math.min(lowestOriginalPrice, regularPrice);

        const promoPriceStr = variant.Promotion_price;
        if (promoPriceStr && isPromotionActive(variant)) {
            const promoPrice = parseFloat(String(promoPriceStr));
            if (!isNaN(promoPrice)) {
                lowestPrice = Math.min(lowestPrice, promoPrice);
            } else {
                lowestPrice = Math.min(lowestPrice, regularPrice);
            }
        } else {
            lowestPrice = Math.min(lowestPrice, regularPrice);
        }
    });
    
    group.minPrice = lowestPrice;
    if (lowestOriginalPrice > lowestPrice) {
        group.originalMinPrice = lowestOriginalPrice;
    } else {
        // Set to undefined if there's no active promotion across all variants
        group.originalMinPrice = undefined;
    }

    if (group.variants.length > 0 && !group.image && group.variants[0].Image_URL) {
      group.image = group.variants[0].Image_URL;
    }
    
    if (group.tags && group.tags.toLowerCase().includes('highlight') && !highlight) {
      highlight = group;
    }
    return group;
  });
  
  return { grouped: groupedArray, highlight };
};


/**
 * Retrieves knowledge base information for a given product name, cleaning the name for better matching.
 * @param rawName - The raw product name from the data.
 * @returns A knowledge base entry or undefined if not found.
 */
export const getKnowledgeFor = (rawName: string): MenuKnowledge | undefined => {
  if (!rawName) return undefined;

  // Clean the name for better matching by removing common variations.
  const cleanedName = rawName
    .replace(/\(.*?\)/g, '')      // e.g., (ร้อน)
    .replace(/\*.*?\*/g, '')      // e.g., *NEW*
    .replace(/-/g, ' ')           // Hyphens to spaces
    .replace(/22\s*ออนซ์-G/g, '')  // Specific size formats
    .replace(/22\s*ออนซ์/g, '')   // Common size format
    .replace(/22oz\./g, '')       // Another size format
    .trim();

  // 1. Exact match (case-sensitive) on raw and cleaned names for performance
  if (MENU_KNOWLEDGE_BASE[rawName]) return MENU_KNOWLEDGE_BASE[rawName];
  if (MENU_KNOWLEDGE_BASE[cleanedName]) return MENU_KNOWLEDGE_BASE[cleanedName];

  // 2. Case-insensitive and partial matching
  const lowerCleaned = cleanedName.toLowerCase();
  const kbKeys = Object.keys(MENU_KNOWLEDGE_BASE);

  // Case-insensitive exact match
  let foundKey = kbKeys.find(k => k.toLowerCase().trim() === lowerCleaned);
  if (foundKey) return MENU_KNOWLEDGE_BASE[foundKey];

  // Partial match: Check if the product name starts with a known KB key.
  // This handles cases like: rawName "ชานมเย็น22ออนซ์" and KB key "ชานมเย็น"
  foundKey = kbKeys.find(k => lowerCleaned.startsWith(k.toLowerCase().trim()));
  if (foundKey) return MENU_KNOWLEDGE_BASE[foundKey];
  
  // Partial match: Check if a known KB key starts with the product name.
  // This is less common but handles cases where the KB key is more specific.
  // e.g., rawName "แดงมะนาวโซดาเย็น" and KB key "แดงมะนาวโซดาเย็น 22 ออนซ์-G"
  foundKey = kbKeys.find(k => k.toLowerCase().trim().startsWith(lowerCleaned));
  if (foundKey) return MENU_KNOWLEDGE_BASE[foundKey];
  
  return undefined;
};