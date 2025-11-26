
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ProductGroup, LanguageKey, Screen } from '../types';
import ProductCard from './ProductCard';
import HighlightProductDisplay from './HighlightProductDisplay';
import LoadingSpinner from './LoadingSpinner';
import { getKnowledgeFor } from '../services/productService';
import { getTimeBucket } from '../utils/time';
import BowIntro from './BowIntro';
import OnboardingGuide, { GuideStep } from './OnboardingGuide';

const INITIAL_ITEMS_TO_SHOW = 12;
const ITEMS_TO_LOAD_INCREMENT = 8;

/**
 * Robustly determines if a product group is caffeinated.
 * It checks the knowledge base via nameKey, then Thai variant names,
 * and finally falls back to category, English names, and tags.
 * @param group The product group to check.
 * @returns True if the group is considered caffeinated.
 */
const isGroupCaffeinated = (group: ProductGroup): boolean => {
  if (!group) return false;

  // 1) Check KB with nameKey (often the Thai name)
  const kbFromNameKey = getKnowledgeFor(group.nameKey || '');
  if (kbFromNameKey) {
    if (kbFromNameKey.base === 'coffee') return true;
    if (kbFromNameKey.profile?.includes('caffeinated')) return true;
  }

  // 2) Check KB with a specific Thai variant name
  const thName = group.variants?.find(v => v.Name_TH)?.Name_TH || group.variants?.[0]?.Name_TH || '';
  if (thName) {
    const kbFromTH = getKnowledgeFor(thName);
    if (kbFromTH) {
      if (kbFromTH.base === 'coffee') return true;
      if (kbFromTH.profile?.includes('caffeinated')) return true;
    }
  }

  // 3) Fallback to EN names, tags, and category
  const rawName = group.variants?.[0]?.Name_EN || group.displayName('en') || '';
  const lowerRaw = rawName.toLowerCase();
  const lowerTags = (group.tags || '').toLowerCase();

  const looksLikeCoffee =
    group.category === 'Coffee' ||
    lowerRaw.includes('coffee') ||
    lowerRaw.includes('cappuccino') ||
    lowerRaw.includes('latte') ||
    lowerRaw.includes('espresso') ||
    lowerTags.includes('coffee');

  if (looksLikeCoffee) return true;

  return false;
};

const AI_BLOCKLIST = [
  'กาแฟร้อน Signature',
  'เอสเพรสโซ่ร้อน',
  'เอสเพรสโซ่เย็น',
];

const isBlockedName = (nameTH: string) =>
  AI_BLOCKLIST.some(n => n === nameTH.trim());


const MenuScreen: React.FC = () => {
  const { 
    getTranslation, 
    groupedProducts, 
    highlightProductGroup, 
    productsLoading, 
    productsError,
    fetchProducts,
    omniContext,
    selectedLanguage,
    aiRecommendation,
    setAiRecommendation,
    setAppTheme,
    isFestiveMode,
    currentScreen
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [visibleItemsCount, setVisibleItemsCount] = useState(INITIAL_ITEMS_TO_SHOW);
  const filterBarRef = useRef<HTMLDivElement>(null);
  
  // Intro Animation State
  const [showIntro, setShowIntro] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Ref for the hesitation timer
  const hesitationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle Intro Animation Logic & Onboarding
  useEffect(() => {
    // Only trigger if Festive Mode is on AND we are strictly on the Menu screen
    if (currentScreen === Screen.Menu) {
        if (isFestiveMode) {
            const hasSeen = sessionStorage.getItem('hasSeenFestiveIntro');
            if (!hasSeen) {
                setShowIntro(true);
                sessionStorage.setItem('hasSeenFestiveIntro', 'true');
            }
        }
        
        // HESITATION LOGIC:
        // Only trigger guide if user stays on this screen for a long time (8 seconds) without interacting
        const hasSeenGuide = localStorage.getItem('hasSeenMenuGuide_v4');
        if (!hasSeenGuide) {
            // Clear any existing timer
            if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);

            // Set timer for hesitation (e.g., 8 seconds)
            // If the user is festive mode, add extra time for the bow animation
            const delay = isFestiveMode ? 9500 : 8000; 
            
            hesitationTimerRef.current = setTimeout(() => {
                setShowOnboarding(true);
            }, delay);
        }
    }
    
    // Cleanup timer on unmount or screen change
    return () => {
        if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);
    };
  }, [isFestiveMode, currentScreen]);
  
  // Listener to CANCEL the guide if user interacts with the filter bar OR the main window scroll
  useEffect(() => {
      const filterBar = filterBarRef.current;
      
      const handleUserInteraction = () => {
          // If user scrolls or clicks, they are not confused. Cancel timer.
          if (hesitationTimerRef.current) {
              clearTimeout(hesitationTimerRef.current);
              hesitationTimerRef.current = null;
          }
      };

      if (filterBar) {
          filterBar.addEventListener('scroll', handleUserInteraction);
      }
      
      // Also listen for main window scroll, as user might scroll down the products list
      window.addEventListener('scroll', handleUserInteraction);

      return () => {
          if (filterBar) {
              filterBar.removeEventListener('scroll', handleUserInteraction);
          }
          window.removeEventListener('scroll', handleUserInteraction);
      };
  }, []);
  
  const handleOnboardingComplete = () => {
      setShowOnboarding(false);
      localStorage.setItem('hasSeenMenuGuide_v4', 'true');
  };
  
  // Function to manually cancel onboarding (called when user clicks a category)
  const cancelOnboardingTimer = () => {
      if (hesitationTimerRef.current) {
          clearTimeout(hesitationTimerRef.current);
          hesitationTimerRef.current = null;
      }
  };

  const menuSteps: GuideStep[] = [
      { elementId: 'category-filter-bar', textKey: 'onboardingSwipeCategories', gesture: 'swipe', position: 'bottom' },
      { elementId: 'first-product-card', textKey: 'onboardingTapProduct', gesture: 'tap', position: 'bottom' }
  ];

  // Update global theme based on active category
  useEffect(() => {
    if (activeCategory === 'allselect') {
      setAppTheme('allselect');
    } else {
      setAppTheme('default');
    }
  }, [activeCategory, setAppTheme]);

  const categories = useMemo(() => {
    const baseCategories = [
      { key: 'allcafe', label: getTranslation('allCafeClassics'), hasItems: groupedProducts.some(p => p.brand === 'All cafe') },
      { key: 'allselect', label: 'All select', hasItems: groupedProducts.some(p => p.brand === 'All select') },
      { key: 'promotions', label: getTranslation('promotions'), hasItems: groupedProducts.some(p => !!p.originalMinPrice) },
      // Updated Recommended logic: Include both 'signature' and 'new' items
      { 
        key: 'recommended', 
        label: getTranslation('recommended'), 
        hasItems: groupedProducts.some(p => {
          const tags = p.tags.toLowerCase();
          return tags.includes('signature') || tags.includes('new');
        })
      },
      { key: 'Thai Favorites', label: getTranslation('thaiFavorites'), hasItems: groupedProducts.some(p => p.tags.toLowerCase().includes('signature from thailand')) },
      { key: 'Coffee', label: getTranslation('coffee'), hasItems: groupedProducts.some(p => p.category === 'Coffee') },
      { key: 'Tea', label: getTranslation('tea'), hasItems: groupedProducts.some(p => p.category === 'Tea') },
      { key: 'Chocolate', label: getTranslation('chocolate'), hasItems: groupedProducts.some(p => p.category === 'Chocolate') },
      { key: 'Milk', label: getTranslation('milk'), hasItems: groupedProducts.some(p => p.category === 'Milk') },
      { key: 'Fruit', label: getTranslation('fruit'), hasItems: groupedProducts.some(p => p.category === 'Fruit') },
      { key: 'Soda', label: getTranslation('soda'), hasItems: groupedProducts.some(p => p.category === 'Soda') },
    ];

    const availableCategories = baseCategories.filter(cat => cat.hasItems);

    return [
      { key: 'all', label: getTranslation('allCategories') },
      ...availableCategories
    ];
  }, [getTranslation, groupedProducts]);

  const typeFilters = useMemo(() => [
      { key: 'all', label: getTranslation('allTypes') },
      { key: 'hot', label: getTranslation('hot') },
      { key: 'iced', label: getTranslation('iced') },
      { key: 'frappe', label: getTranslation('frappe') },
  ], [getTranslation]);

  useEffect(() => {
    // If the currently active category is no longer available in the dynamic list,
    // reset the filter to 'all' to avoid a broken state.
    const activeCategoryExists = categories.some(cat => cat.key === activeCategory);
    if (!activeCategoryExists) {
      setActiveCategory('all');
    }
  }, [categories, activeCategory]);


  const handleCategoryClick = (key: string, event: React.MouseEvent<HTMLButtonElement>) => {
    cancelOnboardingTimer(); // User interacted, don't show guide
    setActiveCategory(key);
    const filterBar = filterBarRef.current;
    const button = event.currentTarget;
    if (filterBar && button) {
        const containerWidth = filterBar.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;

        const scrollTarget = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

        filterBar.scrollTo({
            left: scrollTarget,
            behavior: 'smooth',
        });
    }
  };

  const handleTypeClick = (key: string) => {
    cancelOnboardingTimer(); // User interacted, don't show guide
    setActiveTypeFilter(key);
    setVisibleItemsCount(INITIAL_ITEMS_TO_SHOW);
  };

  const normalizedTimeOfDay = useMemo(() => {
    const raw = omniContext?.timeOfDay?.toLowerCase() || '';
    if (raw === 'morning') return 'morning';
    if (raw === 'midday') return 'midday';
    if (raw === 'afternoon') return 'afternoon';
    if (raw === 'evening') return 'evening';
    if (raw === 'night') return 'night';
    if (raw === 'late-night') return 'late-night';
    // Fallback if no exact match or context is missing.
    return getTimeBucket();
  }, [omniContext]);


  const filteredAndSortedProducts = useMemo(() => {
    let products = groupedProducts;

    // 1. Filter by Category
    if (activeCategory !== 'all') {
      switch (activeCategory) {
        case 'allcafe':
          products = products.filter(group => group.brand === 'All cafe');
          break;
        case 'allselect':
          products = products.filter(group => group.brand === 'All select');
          break;
        case 'promotions':
          products = products.filter(group => !!group.originalMinPrice);
          break;
        case 'recommended':
          // Updated: Include both 'signature' and 'new' items
          products = products.filter(group => {
            const tags = group.tags.toLowerCase();
            return tags.includes('signature') || tags.includes('new');
          });
          // Explicitly sort NEW items to the top
          products.sort((a, b) => {
             const aIsNew = a.tags.toLowerCase().includes('new');
             const bIsNew = b.tags.toLowerCase().includes('new');
             if (aIsNew && !bIsNew) return -1;
             if (!aIsNew && bIsNew) return 1;
             return 0;
          });
          break;
        case 'Thai Favorites':
          products = products.filter(group => group.tags.toLowerCase().includes('signature from thailand'));
          break;
        default:
          products = products.filter(group => group.category === activeCategory);
          break;
      }
    }

    // 2. Filter by Type (Hot / Iced / Frappe)
    if (activeTypeFilter !== 'all') {
        products = products.filter(group => 
            group.variants.some(v => v.Type?.toLowerCase() === activeTypeFilter)
        );
    }
    
    // BaristA:i Sense Engine™: Context-aware sorting logic
    if (['all', 'allcafe', 'allselect'].includes(activeCategory)) {
      const scoredProducts = products.map(group => {
        // As requested: Always use the Thai name (Name_TH) of the representative variant for KB lookups.
        const representativeNameTH = group.variants[0]?.Name_TH || '';
        const knowledge = getKnowledgeFor(representativeNameTH);
        
        if (!knowledge) {
          return { group, score: 9999, knowledge }; // Hard demote if not in knowledge base
        }

        let score = 50;
        if (knowledge.base === 'coffee') score -= 6;
        if (knowledge.base === 'tea') score -= 4;
        if (knowledge.base === 'milk') score -= 2;
        if (knowledge.base === 'fruit_juice') score -= 3;
        if (knowledge.base === 'chocolate') score -= 1;
        if (knowledge.base === 'dessert') score += 4;
        if (knowledge.base === 'soda') score -= 2;

        // ----- Language × Culture Layer (Granular) -----
        const asianLangs: LanguageKey[] = ['th', 'jp', 'zh', 'kr', 'my', 'vn', 'in'];
        const westernLangs: LanguageKey[] = ['en', 'fr', 'ru'];
        const isAsian = asianLangs.includes(selectedLanguage);
        const isWestern = westernLangs.includes(selectedLanguage);
        
        const nameTH = group.variants?.[0]?.Name_TH?.toLowerCase?.() ?? '';
        const nameEN = group.variants?.[0]?.Name_EN?.toLowerCase?.() ?? '';
        
        const isEspressoLike = nameTH.includes('เอสเพรสโซ') || nameEN.includes('espresso');
        const isAmericanoLike = nameTH.includes('อเมริกาโน่') || nameEN.includes('americano');
        const isLatteLike = nameTH.includes('ลาเต้') || nameEN.includes('latte');
        const isMatchaLike = knowledge.mainFlavor.includes('matcha') || nameTH.includes('มัทฉะ') || nameEN.includes('matcha');
        const isThaiTeaLike = nameTH.includes('ชานมเย็น') || nameTH.includes('ชาไทย') || nameEN.includes('thai tea');

        // ===== Western users =====
        if (isWestern) {
          // 1) Western + Morning → prefer espresso / americano
          if (normalizedTimeOfDay === 'morning') {
            if (isEspressoLike) score -= 6; // boost สูง
            if (isAmericanoLike) score -= 5;
            if (isLatteLike) score -= 2; // latte ได้ แต่ไม่สูงเท่า espresso
            if (isThaiTeaLike) score += 4; // ของไทยหวานๆ ดันลง
          } else {
            // ช่วงอื่นให้ coffee ปกติ แต่ไม่ต้องแซง espresso ตอนเช้า
            if (isLatteLike) score += 1;
          }
          // Western มักรับเมนูผลไม้/โซดาได้ → แต่ไม่ต้องแซง espresso ตอนเช้า
          if (knowledge.base === 'fruit_juice' && normalizedTimeOfDay !== 'morning') {
            score -= 1;
          }
        }

        // ===== Asian users =====
        if (isAsian) {
          // 1) Asia + Morning → matcha / milk tea
          if (normalizedTimeOfDay === 'morning') {
            if (isMatchaLike) score -= 6; // ให้ matcha ขึ้นก่อน
            if (isThaiTeaLike) score -= 4; // ชานมเย็นขึ้นตอนเช้าได้ระดับนึง
            if (isAmericanoLike) score += 3; // ดันลงเบาๆ
            if (isEspressoLike) score += 5; // ไม่ค่อยดื่ม espresso shot ตอนเช้า
          } else {
            // บ่าย คนเอเชียโอเคกับหวาน / ปั่น
            if (normalizedTimeOfDay === 'afternoon') {
              if (knowledge.profile.includes('dessert-drink')) score -= 2;
            }
          }
          // ของไทยต้องเด้งกว่าปกติ
          if (group.tags.toLowerCase().includes('signature from thailand')) {
            score -= 2;
          }
        }
        
        // Specific recommendation boost for Chinese users
        if (selectedLanguage === 'zh' && knowledge.mainFlavor.includes('coconut')) {
          score -= 5;
        }
        
        const hasIced = group.variants?.some(v => v.Type?.toLowerCase() === 'iced');
        const hasFrappe = group.variants?.some(v => v.Type?.toLowerCase() === 'frappe');
        const hasHot = group.variants?.some(v => v.Type?.toLowerCase() === 'hot');

        // Layer 4: Context Layer (Time, Weather, Promotions)
        const isCoffee = knowledge.base === 'coffee' || knowledge.profile.includes('caffeinated') || group.category === 'Coffee';
        
        switch (normalizedTimeOfDay) {
          case 'morning': // Push coffee, tea, light
            if (isCoffee) score -= 8;
            if (knowledge.base === 'tea' && hasHot) score -= 4;
            if (group.category === 'Pang Yen') score += 8; // Demote desserts
            break;
          case 'midday': // Push cold, refreshing
            if (knowledge.profile.includes('refreshing')) score -= 6;
            if (hasIced) score -= 3;
            break;
          case 'afternoon': // Push cold, sweet, frappe
            if (hasFrappe) score -= 4;
            if (knowledge.profile.includes('sweet')) score -= 2;
            break;
          case 'evening': // Start avoiding caffeine
            if (isCoffee) score += 20; // Moderate demotion
            if (knowledge.profile.includes('comfort') || hasHot) score -= 5;
            break;
          case 'night':
          case 'late-night': // Strictly no caffeine, push comfort
            if (isCoffee) score += 40; // Heavy demotion
            if (knowledge.base === 'chocolate' && hasHot) score -= 8;
            if (knowledge.base === 'milk' && hasHot) score -= 6;
            if (knowledge.profile.includes('comfort')) score -= 5;
            break;
        }
        
        if (omniContext?.temp) {
          if (omniContext.temp >= 30) {
            if (knowledge.profile.includes('refreshing')) score -= 6;
            if (hasIced) score -= 3;
            if (hasFrappe) score -= 1;
            if (hasHot) score += 5;
          } else if (omniContext.temp <= 24) {
            if (hasHot) score -= 5;
          }
        }

        const tags = group.tags.toLowerCase();
        // Explicitly removed generic "new" score boost to prevent unpredictable reordering.
        // "New" items will be handled in the Reordering Phase below.
        
        if (group.originalMinPrice) score -= 3;
        if (tags.includes('signature')) score -= 1;

        if (tags.includes('block')) score += 30;
        if (tags.includes('push')) score -= 15;
        
        return { group, score, knowledge };
      });
      
      scoredProducts.sort((a, b) => a.score - b.score);

      const MAX_PER_CATEGORY_ON_TOP = 3;
      const categoryCountMap: Record<string, number> = {};
      const diverseList: typeof scoredProducts = [];
      const demotedList: typeof scoredProducts = [];

      for (const item of scoredProducts) {
        const { group, knowledge } = item;
        // Special handling: Always allow 'new' items into the diverse list to ensure they stay available for the top slots
        if (group.tags.toLowerCase().includes('new')) {
             diverseList.push(item);
             continue;
        }
        
        const diversityKey = knowledge
          ? knowledge.base
          : group.category === 'Pang Yen' ? 'dessert_pangyen' : group.category;
        
        if ((categoryCountMap[diversityKey] || 0) < MAX_PER_CATEGORY_ON_TOP) {
          diverseList.push(item);
          categoryCountMap[diversityKey] = (categoryCountMap[diversityKey] || 0) + 1;
        } else {
          demotedList.push(item);
        }
      }

      const sortedList = [...diverseList, ...demotedList].map(item => item.group);

      // --- Reordering Phase: AI Winner -> New Items -> Rest ---
      
      const isBrandOrAllFilter = ['all', 'allcafe', 'allselect'].includes(activeCategory);
      const isStrictNoCoffeeTime = normalizedTimeOfDay === 'late-night' || normalizedTimeOfDay === 'night';
      const westernLangs: LanguageKey[] = ['en', 'fr', 'ru'];
      const isWesternUser = westernLangs.includes(selectedLanguage);

      // Find the first item that qualifies as an AI recommendation
      let aiWinnerId: string | null = null;
      
      if (isBrandOrAllFilter && activeTypeFilter === 'all') {
        const candidate = sortedList.find(g => {
           const nameTH = g.variants[0]?.Name_TH || '';
           if (isBlockedName(nameTH)) return false;
           
           const kb = getKnowledgeFor(nameTH);
           if (!kb) return false;

           if (isStrictNoCoffeeTime && (kb.base === 'coffee' || kb.profile?.includes('caffeinated'))) return false;

           if (isWesternUser && normalizedTimeOfDay === 'morning') {
             if (nameTH.includes('ชานม') || nameTH.includes('ชาไทย')) return false;
           }

           const tags = g.tags?.toLowerCase?.() ?? '';
           if (tags.includes('common') || tags.includes('basic')) return false;
           
           return true;
        });
        if (candidate) {
            aiWinnerId = candidate.id;
        }
      }

      // Explicit Reordering: 
      // Rank 1: AI Winner (if any)
      // Rank 2: New Items (bypassing other logic)
      // Rank 3: Rest of the menu
      
      if (aiWinnerId) {
          const aiItem = sortedList.find(g => g.id === aiWinnerId);
          if (aiItem) {
              // Filter everything else except the AI item
              const others = sortedList.filter(g => g.id !== aiWinnerId);
              
              // Split others into New and Rest
              const newItems = others.filter(g => g.tags.toLowerCase().includes('new'));
              const restItems = others.filter(g => !g.tags.toLowerCase().includes('new'));
              
              return [aiItem, ...newItems, ...restItems];
          }
      }

      // Fallback if no AI winner: New Items -> Rest
      const newItems = sortedList.filter(g => g.tags.toLowerCase().includes('new'));
      const restItems = sortedList.filter(g => !g.tags.toLowerCase().includes('new'));
      return [...newItems, ...restItems];
    }

    return products;
  }, [groupedProducts, activeCategory, activeTypeFilter, omniContext, selectedLanguage, normalizedTimeOfDay]);
  
  // Effect to set and clear the AI recommendation
  useEffect(() => {
    const isBrandOrAllFilter = ['all', 'allcafe', 'allselect'].includes(activeCategory);
    if (isBrandOrAllFilter && filteredAndSortedProducts.length > 0 && activeTypeFilter === 'all') {
      
      // Determine if we have an AI Winner based on the first item
      // Note: filteredAndSortedProducts[0] should be the AI Winner due to the Reordering Phase above.
      // However, we must verify if it actually qualifies as one (e.g. not just a "New" item pushed to top by fallback)
      
      const topPick = filteredAndSortedProducts[0];
      const nameTH = topPick.variants[0]?.Name_TH || '';
      
      // Basic qualification check again to be safe
      const kb = getKnowledgeFor(nameTH);
      const isStrictNoCoffeeTime = normalizedTimeOfDay === 'late-night' || normalizedTimeOfDay === 'night';
      const westernLangs: LanguageKey[] = ['en', 'fr', 'ru'];
      const isWesternUser = westernLangs.includes(selectedLanguage);
      
      const isValidRecommendation = (() => {
          if (isBlockedName(nameTH)) return false;
          if (!kb) return false;
          if (isStrictNoCoffeeTime && (kb.base === 'coffee' || kb.profile?.includes('caffeinated'))) return false;
          if (isWesternUser && normalizedTimeOfDay === 'morning' && (nameTH.includes('ชานม') || nameTH.includes('ชาไทย'))) return false;
          const tags = topPick.tags?.toLowerCase?.() ?? '';
          if (tags.includes('common') || tags.includes('basic')) return false;
          return true;
      })();

      if (isValidRecommendation) {
         setAiRecommendation(topPick);
      } else {
         setAiRecommendation(null);
      }
      
    } else {
      // Clear recommendation if filters are applied or there are no products.
      setAiRecommendation(null);
    }

    // Cleanup function to clear recommendation when leaving the menu screen.
    return () => {
      setAiRecommendation(null);
    };
  }, [filteredAndSortedProducts, activeCategory, activeTypeFilter, setAiRecommendation, omniContext, normalizedTimeOfDay, selectedLanguage]);


  useEffect(() => {
    setVisibleItemsCount(INITIAL_ITEMS_TO_SHOW);
  }, [activeCategory, activeTypeFilter]);

  const itemsToDisplay = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleItemsCount);
  }, [filteredAndSortedProducts, visibleItemsCount]);

  const handleLoadMore = () => {
    cancelOnboardingTimer(); // User interacting with load more means they aren't stuck on filtering
    setVisibleItemsCount(prevCount => prevCount + ITEMS_TO_LOAD_INCREMENT);
  };

  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-10">
        <LoadingSpinner />
        <p className="mt-4 glass-panel px-3 py-1.5 inline-block text-sm">
            {getTranslation('loadingMenu')}
        </p>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-10 text-center max-w-sm mx-auto">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-3">{getTranslation('systemErrorTitle')}</h2>
          <p className="text-sm mb-2">{getTranslation('systemErrorBody1')}</p>
          <p className="text-sm mb-2">{getTranslation('systemErrorBody2')}</p>
          <p className="text-sm mb-4">{getTranslation('systemErrorBody3')}</p>
        </div>
        <button
            onClick={fetchProducts}
            className="mt-6 accent-button py-2.5 px-5"
        >
            {getTranslation('tryAgain')}
        </button>
      </div>
    );
  }
  
  const isNight = normalizedTimeOfDay === 'evening' || normalizedTimeOfDay === 'night' || normalizedTimeOfDay === 'late-night';

  const showHighlight =
    !aiRecommendation &&
    highlightProductGroup &&
    (activeCategory === 'all' || highlightProductGroup.category === activeCategory) &&
    // Stricter rule: At night, do not show if it's a caffeinated group.
    !(isNight && isGroupCaffeinated(highlightProductGroup));

  return (
    <>
      {/* Festive Bow Unwrap Animation Overlay */}
      {showIntro && <BowIntro onFinished={() => setShowIntro(false)} />}
      
      {/* Interactive Guide Overlay (Ghost Finger) - Only shows if user is hesitant */}
      {showOnboarding && !showIntro && (
        <OnboardingGuide steps={menuSteps} onComplete={handleOnboardingComplete} />
      )}

      <div className={`max-w-md mx-auto animate-fadeIn ${showIntro ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 transition-all duration-700'}`}>
        <div className="glass-panel">
          <div className="pt-6 px-4">
            <h1 className={`text-[4vw] sm:text-2xl md:text-3xl font-bold text-left whitespace-nowrap ${isFestiveMode ? 'font-serif-festive tracking-wide text-neutral-800' : 'heading-font'}`}>
              {getTranslation('menuTitle')}
            </h1>
          </div>

          {/* Category Filter Bar - ID Added for Guide */}
          <div id="category-filter-bar" ref={filterBarRef} className="p-4 filter-scroll overflow-x-auto relative z-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              {categories.map(cat => {
                const isActive = activeCategory === cat.key;
                let activeStyle = 'bg-[var(--bdl-brand)] text-[var(--bdl-text-inverse)]'; // Default active style
                if (isActive) {
                    if (cat.key === 'allcafe') {
                        activeStyle = 'bg-[#795548] text-white'; // Brown for All Cafe
                    } else if (cat.key === 'allselect') {
                        activeStyle = 'bg-[#0a2f56] text-white'; // Dark blue for All Select
                    }
                }

                return (
                  <button
                    key={cat.key}
                    onClick={(e) => handleCategoryClick(cat.key, e)}
                    className={`px-4 py-2 rounded-[var(--bdl-radius-pill)] text-sm font-semibold transition-all duration-200 shadow-sm
                      ${isActive
                        ? activeStyle
                        : 'bg-white/80 border border-[var(--bdl-glass-border)] hover:bg-white/90'
                      }`}
                    aria-pressed={isActive}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Filter Bar (Hot / Iced / Frappe) */}
          <div className="px-4 pb-2 filter-scroll overflow-x-auto animate-fadeIn">
            <div className="flex items-center gap-2 whitespace-nowrap">
              {typeFilters.map(type => {
                const isActive = activeTypeFilter === type.key;
                return (
                  <button
                    key={type.key}
                    onClick={() => handleTypeClick(type.key)}
                    className={`px-3 py-1.5 rounded-[var(--bdl-radius-pill)] text-xs font-semibold transition-all duration-200 shadow-sm border
                      ${isActive
                        ? 'bg-neutral-800 text-white border-neutral-800'
                        : 'bg-white text-neutral-600 border-[var(--bdl-glass-border)] hover:bg-stone-50'
                      }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 md:p-6 pb-28">
            {showHighlight && highlightProductGroup && (
              <HighlightProductDisplay 
                productGroup={highlightProductGroup}
                activeCategory={activeCategory} 
                activeType={activeTypeFilter}
              />
            )}
            
            {itemsToDisplay.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {itemsToDisplay.map((group, index) => (
                  (showHighlight && group.id === highlightProductGroup?.id) ? null : 
                  <ProductCard 
                    id={index === 0 ? "first-product-card" : undefined} // ID added for Guide
                    key={group.id} 
                    productGroup={group} 
                    activeCategory={activeCategory}
                    activeType={activeTypeFilter}
                    isAiRecommended={!!aiRecommendation && aiRecommendation.id === group.id}
                    priority={index < 8} // Ensure top 8 items load instantly (eager)
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-sm py-8 px-4">
                {activeCategory === 'Special Menu' ? (
                  <div className="flex flex-col items-center">
                    <span className="text-5xl mb-4 animate-pulse-emoji" role="img" aria-label="thinking face">🧪</span>
                    <p className="font-semibold">{getTranslation('noSpecialMenuSuggestion')}</p>
                  </div>
                ) : (
                  <p>{getTranslation('noProductsMatchFiltersSuggestion')}</p>
                )}
              </div>
            )}

            {filteredAndSortedProducts.length > itemsToDisplay.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="accent-button py-3 px-8"
                >
                  {getTranslation('loadMore')}
                </button>
              </div>
            )}

            {itemsToDisplay.length > 0 && filteredAndSortedProducts.length <= visibleItemsCount && (
              <p className="text-center text-sm text-[var(--bdl-text-secondary)] py-8 italic">
                {getTranslation('noMoreProducts')}
              </p>
            )}

            {/* Advertising Image Disclaimer - Standard Position */}
            <div className="text-center pb-4 opacity-60">
                <p className={`text-[10px] ${isFestiveMode ? 'font-serif-festive italic' : ''}`}>
                    * {getTranslation('advertisingImageDisclaimer')}
                </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuScreen;
