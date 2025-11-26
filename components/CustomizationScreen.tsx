
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Screen, Addon, Product, CartItem } from '../types';
import { isPromotionActive } from '../services/productService';
import MediaDisplay from './MediaDisplay';
import LoadingSpinner from './LoadingSpinner';
import { triggerSuccessHaptic } from '../utils/haptics';
import OnboardingGuide, { GuideStep } from './OnboardingGuide';

const PostAddToCartModal = lazy(() => import('./PostAddToCartModal'));

const CustomizationScreen: React.FC = () => {
  const { 
    currentProductGroupForCustomization: group, 
    navigateTo, 
    getTranslation, 
    getSizeTranslation,
    selectedLanguage, 
    addToCart,
    removeFromCart, // Added removeFromCart
    isFestiveMode
  } = useAppContext();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [selectedSweetness, setSelectedSweetness] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isPostAddModalOpen, setIsPostAddModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [lastAddedQuantity, setLastAddedQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptionsSheetOpen, setOptionsSheetOpen] = useState(false);
  const [_hasOpenedOptions, setHasOpenedOptions] = useState(false);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const hesitationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    // HESITATION LOGIC:
    // Only show if group is loaded and guide hasn't been seen AND user hesitates for 5 seconds
    // AND options sheet is NOT open
    if (group && !isOptionsSheetOpen) {
        const hasSeen = localStorage.getItem('hasSeenCustomizationGuide_v4');
        if (!hasSeen) {
            // Clear existing
            if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);
            
            // Set Timer: If user hasn't selected anything in 5 seconds, show hint.
            hesitationTimerRef.current = setTimeout(() => {
                setShowOnboarding(true);
            }, 5000); 
        }
    } else {
        // If options sheet opens, cancel timer and hide onboarding
        cancelHesitationTimer();
        setShowOnboarding(false);
    }
    
    return () => {
        if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);
    }
  }, [group, isOptionsSheetOpen]); // Added isOptionsSheetOpen dependency

  const handleOnboardingComplete = () => {
      setShowOnboarding(false);
      localStorage.setItem('hasSeenCustomizationGuide_v4', 'true');
  };
  
  // Cancels timer if user interacts (e.g., selects type)
  const cancelHesitationTimer = () => {
      if (hesitationTimerRef.current) {
          clearTimeout(hesitationTimerRef.current);
          hesitationTimerRef.current = null;
      }
  };

  const custSteps: GuideStep[] = [
      { elementId: 'cust-type-selection', textKey: 'onboardingSelectType', gesture: 'tap', position: 'top' },
      { elementId: 'cust-add-to-cart-btn', textKey: 'onboardingAddToCart', gesture: 'tap', position: 'top' }
  ];

  const variantsByType = useMemo(() => {
    if (!group) return {};
    return group.variants.reduce((acc, variant) => {
      const type = variant.Type || 'Unknown';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(variant);
      acc[type].sort((a, b) => {
          const sizeOrder: Record<string, number> = {'S': 1, 'Regular': 2, 'M': 3, 'L': 4};
          const orderA = sizeOrder[a.Sizes] || parseFloat(a.Price) || 99;
          const orderB = sizeOrder[b.Sizes] || parseFloat(b.Price) || 99;
          return orderA - orderB;
      });
      return acc;
    }, {} as Record<string, Product[]>);
  }, [group]);

  const resetSelection = useCallback(() => {
    setSelectedType(null);
    setSelectedVariant(null);
    setSelectedSweetness('');
    setSelectedAddons([]);
    setQuantity(1);
    setHasOpenedOptions(false);
    setOptionsSheetOpen(false);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (group) {
      resetSelection();
    }
  }, [group, resetSelection]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOptionsSheetOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = prev; };
  }, [isOptionsSheetOpen]);

  const handleVariantSelect = useCallback((variant: Product) => {
    setSelectedVariant(variant);
    const sweetnessValue = variant.Sweetness;
    // Improved parsing: Handle comma, slash, pipe, or space delimiters to prevent concatenation issues.
    const newSweetnessOpts = (sweetnessValue !== null && sweetnessValue !== undefined)
      ? String(sweetnessValue).split(/[,/|\s]+/).map(s => s.trim()).filter(Boolean)
      : [];
      
    if (newSweetnessOpts.length > 0) {
        // Default logic: 100% -> 75% -> First option
        const defaultSweetnessValue = newSweetnessOpts.includes('100') ? '100'
          : newSweetnessOpts.includes('75') ? '75'
          : newSweetnessOpts[0];
        setSelectedSweetness(defaultSweetnessValue || ''); 
    } else {
        setSelectedSweetness('');
    }
  }, []);

  const sweetnessOptions = useMemo(() => {
    const sweetnessValue = selectedVariant?.Sweetness;
    // Improved parsing logic matching handleVariantSelect
    if (sweetnessValue !== null && sweetnessValue !== undefined) {
      return String(sweetnessValue).split(/[,/|\s]+/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [selectedVariant]);

  const addonOptionsList = useMemo((): Addon[] => {
    if (!selectedVariant?.Addon_Options) return [];
    try {
      const parsedAddons = JSON.parse(selectedVariant.Addon_Options);
      if (Array.isArray(parsedAddons)) {
        return parsedAddons.filter(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.price === 'number');
      }
    } catch (error) {
      console.error("Failed to parse Addon_Options JSON. Falling back to legacy string parsing.", error);
      return selectedVariant.Addon_Options.split(',').map((opt, index) => {
        const [name, priceStr] = opt.split(':');
        return { id: `legacy-${index}`, name: name.trim(), price: parseInt(priceStr, 10) || 0 };
      }).filter(addon => addon.name && !isNaN(addon.price));
    }
    return [];
  }, [selectedVariant]);
  
  const handleTypeSelect = (type: string) => {
    cancelHesitationTimer(); // User interacted, don't show guide
    setHasOpenedOptions(true);
    setSelectedType(type);
    setSelectedVariant(null);
    setSelectedSweetness('');
    setOptionsSheetOpen(true);
  };

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const calculateUnitPrice = useCallback((): number => {
    if (!selectedVariant) return 0;
    
    let basePrice = parseFloat(selectedVariant.Price);
    const promoPriceStr = selectedVariant.Promotion_price;

    if (promoPriceStr && isPromotionActive(selectedVariant)) {
        const promoPrice = parseFloat(String(promoPriceStr));
        if(!isNaN(promoPrice)) {
            basePrice = promoPrice;
        }
    }
    
    let total = basePrice;
    selectedAddons.forEach(addon => (total += addon.price));
    return total;
  }, [selectedVariant, selectedAddons]);
  
  const calculateOriginalUnitPrice = useCallback((): number => {
    if (!selectedVariant) return 0;
    let total = parseFloat(selectedVariant.Price);
    selectedAddons.forEach(addon => (total += addon.price));
    return total;
  }, [selectedVariant, selectedAddons]);


  const handleAddToCart = async () => {
    if (!group || !selectedVariant || isSubmitting) return;
    setIsSubmitting(true);
    triggerSuccessHaptic();
    setOptionsSheetOpen(false);
    const unitPrice = calculateUnitPrice();
    const addedItems = await addToCart(selectedVariant, group, selectedVariant.Sizes, selectedSweetness, selectedAddons, unitPrice, quantity);
    setLastAddedItem(addedItems[0]);
    setLastAddedQuantity(quantity);
    setIsPostAddModalOpen(true);
  };

  const handleConfirmFromModal = () => {
    setIsPostAddModalOpen(false);
    setIsSubmitting(false);
    navigateTo(Screen.Confirmation);
  };

  // FIX: Remove the item from cart if user goes back to edit to prevent duplicates
  const handleEditFromModal = () => {
    if (lastAddedItem) {
        removeFromCart(lastAddedItem.id);
        setLastAddedItem(null);
    }
    setIsPostAddModalOpen(false);
    setIsSubmitting(false);
  };

  const handleAddAnotherFromModal = () => {
    setIsPostAddModalOpen(false);
    setIsSubmitting(false);
    navigateTo(Screen.Menu);
  };

  const isAllSelect = useMemo(() => {
      const b = group?.brand?.toLowerCase().trim() || '';
      return b.includes('all select') || b.includes('allselect');
  }, [group]);

  const bgClass = isAllSelect 
    ? 'bg-gradient-to-b from-[#E0EAFC] to-[#CFDEF3]' 
    : 'bg-gradient-to-b from-stone-200 to-stone-300';

  // Check if this is a "New" item to trigger festive effects
  const isNewItem = useMemo(() => group?.tags.toLowerCase().includes('new'), [group]);
  
  // Determine font style for festive mode
  const headerFontClass = isFestiveMode ? 'font-serif-festive tracking-wide' : 'heading-font';

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-10">
        <LoadingSpinner />
      </div>
    );
  }

  const productName = group.displayName(selectedLanguage);
  const productDescription = selectedVariant?.Description || 
                             selectedVariant?.Descrpition || 
                             group.description || 
                             group.variants.find(v => v.Description || v.Descrpition)?.Description || 
                             group.variants.find(v => v.Description || v.Descrpition)?.Descrpition;

  const unitPrice = calculateUnitPrice();
  const originalUnitPrice = calculateOriginalUnitPrice();
  const grandTotal = unitPrice * quantity;
  const originalGrandTotal = originalUnitPrice * quantity;
  
  const getOptionButtonClass = (isSelected: boolean) => {
    const baseSelected = 'bg-neutral-900 text-white font-semibold ring-2 ring-neutral-900/15 shadow-sm';
    const baseUnselected = 'bg-white/85 text-neutral-800 border border-neutral-300 shadow-sm hover:bg-white/95 focus-visible:ring-2 focus-visible:ring-neutral-400';
    
    return isSelected ? baseSelected : baseUnselected;
  };
  
  const displayImage = selectedVariant?.Image_URL || 
                       (selectedType && variantsByType[selectedType]?.[0]?.Image_URL) ||
                       group.image || 
                       group.variants.find(v => v.Image_URL)?.Image_URL || '';

  return (
    <>
      {showOnboarding && !isOptionsSheetOpen && (
        <OnboardingGuide steps={custSteps} onComplete={handleOnboardingComplete} />
      )}
      
      <div className={`transition-all duration-300 ease-in-out ${isPostAddModalOpen ? 'blur-md scale-[0.98] pointer-events-none' : 'blur-none scale-100'}`}>
        <div className="max-w-md mx-auto animate-fadeIn relative">
          
          {/* Slow Beautiful Confetti for New Items */}
          {isNewItem && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 h-screen -mt-24">
                <style>
                    {`
                        @keyframes slowFall {
                            0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
                            10% { opacity: 1; }
                            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                        }
                        .confetti-piece {
                            position: absolute;
                            top: -10%;
                            border-radius: 2px;
                            animation-name: slowFall;
                            animation-timing-function: linear;
                            animation-iteration-count: infinite;
                        }
                    `}
                </style>
                {Array.from({ length: 20 }).map((_, i) => {
                    const left = Math.random() * 100;
                    const delay = Math.random() * 5;
                    const duration = 8 + Math.random() * 5; // Slow: 8-13s
                    const color = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#E91E63'][Math.floor(Math.random() * 5)];
                    const size = 6 + Math.random() * 6;
                    return (
                        <div 
                            key={i}
                            className="confetti-piece"
                            style={{
                                left: `${left}%`,
                                animationDelay: `${delay}s`,
                                animationDuration: `${duration}s`,
                                backgroundColor: color,
                                width: `${size}px`,
                                height: `${size}px`,
                                opacity: Math.random() * 0.6 + 0.4
                            }}
                        />
                    );
                })}
            </div>
          )}

          <div className="flex justify-start items-center mb-4 relative z-10">
            <button
              onClick={() => navigateTo(Screen.Menu)}
              className="flex items-center font-semibold py-2.5 px-4 rounded-full bg-black/25 backdrop-blur-md border border-white/15 shadow-sm hover:bg-black/40 hover:shadow-md transition-all duration-200 text-white group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {getTranslation('backButton')}
            </button>
          </div>
          
          <div className="mb-6 relative z-10">
            <div className={`relative w-full aspect-[3/4] max-w-64 mx-auto mb-4 rounded-2xl ${bgClass} overflow-hidden shadow-lg group`}>
              <MediaDisplay url={displayImage} altText={productName} type="customization" priority={true} />
              
              {/* Advertising Image Disclaimer - Overlay on Image */}
              <div className="absolute bottom-2 right-3 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                 <span className={`text-[8px] text-black/50 font-medium px-1.5 py-0.5 rounded-md bg-white/40 backdrop-blur-[2px] ${isFestiveMode ? 'font-serif-festive italic' : ''}`}>
                    * {getTranslation('advertisingImageDisclaimer')}
                 </span>
              </div>
            </div>
            <h3 className={`text-3xl font-bold text-center mb-2 drop-shadow-sm ${headerFontClass}`}>
              <span className="bg-white/90 text-neutral-900 px-5 py-2 rounded-xl shadow-sm backdrop-blur-sm inline-block">
                {productName}
              </span>
            </h3>
            
            {productDescription && (
               <div className="text-center px-6 animate-fadeIn mt-3 max-w-sm mx-auto">
                  <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/40 shadow-sm">
                     <p className="text-sm text-neutral-700 font-medium leading-relaxed whitespace-pre-line">
                        {productDescription}
                     </p>
                  </div>
               </div>
            )}
          </div>
          
          <div className={`space-y-6 px-2 relative z-10 ${isFestiveMode ? 'pb-32' : 'pb-6'}`}>
              <div className="glass-panel p-4">
                  <p className="text-center text-sm text-[var(--bdl-text-secondary)] mb-4">
                    {getTranslation('selectDrinkTypePrompt')}
                  </p>
                  <label className={`block font-semibold mb-3 ${headerFontClass}`}>{getTranslation('typeLabel')}</label>
                  <div id="cust-type-selection" className="grid grid-cols-3 gap-3">
                    {Object.keys(variantsByType).map(type => {
                      const isSelected = selectedType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => handleTypeSelect(type)}
                          className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out text-center focus:outline-none flex items-center justify-center gap-2 relative ${getOptionButtonClass(isSelected)}`}
                          aria-pressed={isSelected}
                          >
                          {getTranslation(type.toLowerCase()) || type}
                        </button>
                      );
                    })}
                  </div>
              </div>
          </div>
        </div>
        
        {/* Bottom Sheet + Overlay (Tailwind only) */}
        <div
          className={`fixed inset-0 z-[210] ${isOptionsSheetOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          aria-hidden={!isOptionsSheetOpen}
        >
          {/* overlay */}
          <div
            onClick={() => setOptionsSheetOpen(false)}
            className={`absolute inset-0 bg-black/60 transition-opacity duration-300
                        ${isOptionsSheetOpen ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* bottom sheet */}
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-0 left-0 w-full max-w-[600px] mx-auto right-0
                        bg-white/90 backdrop-blur-md
                        border-t border-white/30 shadow-[0_-8px_40px_-5px_rgba(0,0,0,.35)]
                        transition-transform duration-300 ease-out
                        ${isOptionsSheetOpen ? 'translate-y-0' : 'translate-y-full'}
                        rounded-t-2xl flex flex-col max-h-[90dvh]`}
          >
            {/* handle */}
            <div className="flex justify-center py-2 cursor-grab flex-shrink-0" onClick={() => setOptionsSheetOpen(false)}>
              <div className="h-1.5 w-12 bg-neutral-400/40 rounded-full" />
            </div>

            {/* content */}
            <div className="px-4 pb-4 space-y-6 overflow-y-auto flex-1 min-h-0">
              {selectedType && variantsByType[selectedType] && (
                  <div>
                      <label className={`block font-semibold mb-2 ${headerFontClass}`}>{getTranslation('sizeLabel')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {variantsByType[selectedType].map(variant => {
                              const isSelected = selectedVariant?.Product_Code === variant.Product_Code;
                              const regularPrice = parseFloat(variant.Price);
                              const promoPriceStr = variant.Promotion_price;
                              let promoPrice: number | null = null;
                              if (promoPriceStr) {
                                  const parsedPromo = parseFloat(String(promoPriceStr));
                                  if (!isNaN(parsedPromo)) {
                                      promoPrice = parsedPromo;
                                  }
                              }
                              const isPromo = promoPrice !== null && isPromotionActive(variant);

                              return (
                              <button
                                  key={variant.Product_Code || variant.Name_EN}
                                  onClick={() => handleVariantSelect(variant)}
                                  className={`py-2 px-1 rounded-xl text-sm transition-all duration-300 text-center focus:outline-none relative ${getOptionButtonClass(isSelected)}`}
                                  aria-pressed={isSelected}
                              >
                                  <div className="flex flex-col items-center justify-center leading-tight">
                                      {/* Directly use the size from column data via translation helper */}
                                      <span>{getSizeTranslation(variant.Sizes)}</span>
                                      {isPromo && promoPrice !== null ? (
                                          <div className="flex items-baseline gap-1.5 mt-1">
                                              <span className="font-bold text-base">฿{promoPrice.toFixed(2)}</span>
                                              <span className="text-xs line-through opacity-70">฿{regularPrice.toFixed(2)}</span>
                                          </div>
                                      ) : (
                                          <span className="font-semibold mt-1">฿{variant.Price}</span>
                                      )}
                                  </div>
                              </button>
                              );
                          })}
                      </div>
                  </div>
              )}
              
              {selectedVariant && sweetnessOptions.length > 0 && (
                  <div className="animate-slideUpFadeIn">
                      <label className={`block font-semibold mb-2 ${headerFontClass}`}>{getTranslation('sweetnessLabel')}</label>
                      <div className="grid grid-cols-3 gap-2">
                          {sweetnessOptions.map(opt => {
                          const isSelected = selectedSweetness === opt;
                          return (
                              <button
                              key={opt}
                              onClick={() => setSelectedSweetness(opt)}
                              className={`flex-1 py-3 px-3 rounded-lg text-sm transition-all duration-300 text-center focus:outline-none relative ${getOptionButtonClass(isSelected)}`}
                              aria-pressed={isSelected}
                              >
                              {opt}%
                              </button>
                          );
                          })}
                      </div>
                  </div>
              )}

              {selectedVariant && addonOptionsList.length > 0 && (
                  <div className="animate-slideUpFadeIn" style={{ animationDelay: '75ms' }}>
                      <label className={`block font-semibold mb-2 ${headerFontClass}`}>{getTranslation('addonLabel')}</label>
                      <div className="space-y-2">
                          {addonOptionsList.map(addon => {
                            const isSelected = selectedAddons.some(a => a.id === addon.id);
                            return (
                              <label 
                                key={addon.id} 
                                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
                                    ${isSelected
                                      ? 'bg-white/90 text-neutral-900 border border-neutral-300 ring-2 ring-neutral-400/30'
                                      : 'bg-white/70 text-neutral-800 border border-neutral-300 hover:bg-white/85'}`}
                              >
                                <span className="flex-1">{addon.name} (+฿{addon.price})</span>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-[var(--day-accent)]' : 'bg-gray-300'}`}>
                                  {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleAddonToggle(addon)}
                                  className="sr-only"
                                />
                              </label>
                            )
                          })}
                      </div>
                  </div>
              )}
            </div>

            {/* footer - safe area padding added */}
            <div className={`px-4 pt-3 border-t border-white/20 flex-shrink-0 pb-[calc(env(safe-area-inset-bottom,30px)+${isFestiveMode ? '2.5rem' : '1.5rem'})]`}>
              {selectedVariant && (
                  <div className="flex items-center justify-center gap-5 mb-4">
                      <button 
                          onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 text-xl font-bold shadow-sm hover:bg-gray-50 transition-colors active:scale-95 flex items-center justify-center text-neutral-700"
                          aria-label="Decrease quantity"
                      >
                          -
                      </button>
                      <div className="flex flex-col items-center justify-center">
                           <span className="text-xs text-gray-500 font-medium">{getTranslation('quantityLabel')}</span>
                           <span className="text-xl font-bold min-w-[2rem] text-center heading-font">{quantity}</span>
                      </div>
                      <button 
                          onClick={() => setQuantity(q => Math.min(20, q + 1))} 
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 text-xl font-bold shadow-sm hover:bg-gray-50 transition-colors active:scale-95 flex items-center justify-center text-neutral-700"
                          aria-label="Increase quantity"
                      >
                          +
                      </button>
                  </div>
              )}
            
              <div className="flex justify-between items-center">
                  <div className="flex items-baseline min-h-[40px]" aria-live="polite" aria-atomic="true">
                      {selectedVariant && (
                          <>
                              <span className="text-sm font-semibold">{getTranslation('totalLabel')}:</span>
                              {originalGrandTotal > grandTotal ? (
                                  <>
                                      <span className="ml-2 font-extrabold text-[var(--day-accent)] text-3xl">฿{grandTotal.toFixed(2)}</span>
                                      <span className="ml-2 text-lg line-through text-[var(--bdl-text-secondary)]">฿{originalGrandTotal.toFixed(2)}</span>
                                  </>
                              ) : (
                                  <span className="ml-2 text-2xl font-bold">฿{grandTotal.toFixed(2)}</span>
                              )}
                          </>
                      )}
                  </div>
                  <button 
                      id="cust-add-to-cart-btn"
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || isSubmitting}
                      className={`py-3 px-6 rounded-full font-bold shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                         ${isFestiveMode 
                            ? 'bg-gradient-to-r from-[#8B0000] to-[#58181F] text-[#F0EAD6] border border-[#C5A059] shadow-red-900/30' 
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-emerald-900/20 border border-emerald-400/20'
                         }
                      `}
                  >
                      {getTranslation('addToCartButton')}
                  </button>
              </div>
              <p className="text-[10px] text-[var(--bdl-text-secondary)] text-center mt-1.5">{getTranslation('priceDisclaimer')}</p>
            </div>
          </div>
        </div>

      </div>
      
      <Suspense fallback={null}>
        {isPostAddModalOpen && (
            <PostAddToCartModal 
                isOpen={isPostAddModalOpen}
                onConfirm={handleConfirmFromModal}
                onClose={handleEditFromModal}
                onAddAnother={handleAddAnotherFromModal}
                item={lastAddedItem}
                quantity={lastAddedQuantity}
            />
        )}
      </Suspense>
    </>
  );
};

export default CustomizationScreen;
