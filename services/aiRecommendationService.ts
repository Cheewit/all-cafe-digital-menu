// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { ProductGroup, OmniContext, LanguageKey } from '../types';
import { getKnowledgeFor } from './productService';
import { getTimeBucket } from '../utils/time';

export interface DetailedRecommendations {
  type: string | null;
  size: string | null; // e.g., 'S', 'L', 'Regular'
  sweetness: string | null; // e.g., '100', '75'
}

/**
 * Provides comprehensive AI recommendations for type, size, and sweetness
 * based on the product and the current context.
 * @param group The product group to analyze.
 * @param omniContext The current environmental context (weather, time).
 * @param selectedLanguage The user's selected language for cultural context.
 * @returns An object with recommendations for type, size, and sweetness.
 */
export const getAiDetailedRecommendations = (
  group: ProductGroup,
  omniContext: OmniContext | null,
  selectedLanguage: LanguageKey
): DetailedRecommendations => {
  if (!group) return { type: null, size: null, sweetness: null };

  // --- 1. Recommend Type ---
  const availableTypes = Array.from(new Set(group.variants.map(v => v.Type.toLowerCase())));
  let recommendedType: string | null = null;
  const timeOfDay = omniContext?.timeOfDay?.toLowerCase() || getTimeBucket();
  
  if (availableTypes.length > 1) {
    const scores: Record<string, number> = { hot: 50, iced: 50, frappe: 50 };

    switch (timeOfDay) {
      case 'morning': scores.hot -= 8; scores.iced -= 2; break;
      case 'midday': case 'afternoon': scores.iced -= 8; scores.frappe -= 5; scores.hot += 5; break;
      case 'evening': case 'late-night': case 'night': scores.hot -= 6; scores.iced += 4; scores.frappe += 6; break;
    }

    if (omniContext?.temp) {
      if (omniContext.temp >= 29) { scores.iced -= 10; scores.frappe -= 7; scores.hot += 10; }
      else if (omniContext.temp <= 23) { scores.hot -= 10; scores.iced += 5; }
    }

    let bestScore = Infinity;
    for (const type of availableTypes) {
      if (scores[type] < bestScore) {
        bestScore = scores[type];
        recommendedType = type;
      }
    }
  } else if (availableTypes.length === 1) {
    recommendedType = availableTypes[0];
  }

  // --- 2. Recommend Size ---
  let recommendedSize: string | null = null;
  const variantsForType = recommendedType
    ? group.variants.filter(v => v.Type.toLowerCase() === recommendedType)
    : group.variants;

  if (variantsForType.length > 1) {
    const availableSizes = variantsForType.map(v => v.Sizes);
    const sizeOrder = ['S', 'Regular', 'M', 'L'];
    const sortedSizes = [...availableSizes].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    if (timeOfDay === 'morning' || timeOfDay === 'evening' || timeOfDay === 'late-night' || timeOfDay === 'night') {
        recommendedSize = sortedSizes[0] || null;
    } else { // Midday, Afternoon
        recommendedSize = sortedSizes[sortedSizes.length - 1] || null;
    }
  }

  // --- 3. Recommend Sweetness ---
  let recommendedSweetness: string | null = null;
  const representativeVariant = variantsForType[0] ?? group.variants[0];
  // Bug fix: Coerce Sweetness to string before splitting, as it might be a number.
  const sweetnessValue = representativeVariant?.Sweetness;
  const sweetnessOptions = (sweetnessValue !== null && sweetnessValue !== undefined)
    ? String(sweetnessValue).split(',').map(s => s.trim()).filter(Boolean)
    : [];
  
  if (sweetnessOptions.length > 1) {
    const westernLangs: LanguageKey[] = ['en', 'fr', 'ru'];
    const isWestern = westernLangs.includes(selectedLanguage);
    const knowledge = getKnowledgeFor(group.nameKey);

    if (knowledge?.profile.includes('dessert-drink')) {
      if (sweetnessOptions.includes('100')) recommendedSweetness = '100';
    } else if (isWestern) {
      if (sweetnessOptions.includes('75')) recommendedSweetness = '75';
      else if (sweetnessOptions.includes('50')) recommendedSweetness = '50';
    } else { // Asian or other
      if (timeOfDay === 'morning') {
        if (sweetnessOptions.includes('75')) recommendedSweetness = '75';
      } else {
        if (sweetnessOptions.includes('100')) recommendedSweetness = '100';
      }
    }
    // Final fallback
    if (!recommendedSweetness && sweetnessOptions.length > 0) {
      recommendedSweetness = sweetnessOptions.includes('100') ? '100' : sweetnessOptions[0];
    }
  }

  return { type: recommendedType, size: recommendedSize, sweetness: recommendedSweetness };
};