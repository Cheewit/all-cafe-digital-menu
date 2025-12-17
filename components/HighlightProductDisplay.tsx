
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Product, ProductGroup, Screen } from '../types';
import MediaDisplay from './MediaDisplay';

interface HighlightProductProps {
  productGroup: ProductGroup;
  activeCategory: string;
  activeType?: string;
}

const HighlightProductDisplay: React.FC<HighlightProductProps> = ({ productGroup, activeType = 'all' }) => {
  const { navigateTo, getTranslation, selectedLanguage, isFestiveMode } = useAppContext();

  const { displayImageUrl, displayedVariantType } = useMemo(() => {
    // Apply priority based on time of day
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 17 || currentHour < 5;

    let priorityOrder = isEvening
      ? ['hot', 'iced', 'frappe']
      : ['iced', 'frappe', 'hot'];
      
    if (activeType && activeType !== 'all') {
        priorityOrder = [activeType, ...priorityOrder.filter(t => t !== activeType)];
    }

    let foundVariant: Product | null = null;
    for (const type of priorityOrder) {
      const variant = productGroup.variants.find(v => v.Type.toLowerCase() === type);
      if (variant) {
        foundVariant = variant;
        break;
      }
    }

    if (!foundVariant && productGroup.variants.length > 0) {
      foundVariant = productGroup.variants[0];
    }

    if (foundVariant) {
      return {
        displayImageUrl: foundVariant.Image_URL || productGroup.image || '',
        displayedVariantType: foundVariant.Type.toLowerCase(),
      };
    }
    
    return {
      displayImageUrl: productGroup.image || '',
      displayedVariantType: 'all',
    };
  }, [productGroup, activeType]);

  const productName = productGroup.displayName(selectedLanguage);

  // Brand Logic for Background
  const isAllSelect = useMemo(() => {
      const b = productGroup.brand?.toLowerCase().trim() || '';
      return b.includes('all select') || b.includes('allselect');
  }, [productGroup.brand]);
  
  // Check if product is new
  const isNew = useMemo(() => productGroup.tags.toLowerCase().includes('new'), [productGroup.tags]);

  // Updated background logic
  let bgClass;
  if (isFestiveMode) {
      // European Café: Ivory/Cream Gradient
      bgClass = 'festive-card-bg';
  } else {
      bgClass = isAllSelect 
        ? 'bg-gradient-to-b from-[#E0EAFC] to-[#CFDEF3]' 
        : 'bg-gradient-to-b from-stone-200 to-stone-300';
  }

  const handleHighlightClick = () => {
    navigateTo(Screen.Customization, productGroup, displayedVariantType);
  };
  
  const isPromo = productGroup.originalMinPrice && productGroup.originalMinPrice > productGroup.minPrice;

  // Random glitter particles (Applied to ALL themes, but only for NEW items)
  const glitterParticles = useMemo(() => {
      return Array.from({ length: 8 }).map((_, i) => {
          const top = Math.random() * 80 + 10; // 10% to 90%
          const left = Math.random() * 80 + 10;
          const delay = Math.random() * 2;
          const colors = ['bg-white', 'bg-cyan-300', 'bg-[#FFD700]']; // White, Ice Blue, Gold
          const colorClass = colors[Math.floor(Math.random() * colors.length)];
          return (
              <div 
                  key={i}
                  className={`glitter-particle ${colorClass}`}
                  style={{ 
                      top: `${top}%`, 
                      left: `${left}%`, 
                      animationDelay: `${delay}s`,
                      boxShadow: '0 0 3px currentColor'
                  }} 
              />
          );
      });
  }, []);

  return (
    <div className="mb-6" onClick={handleHighlightClick}>
      <div className={`glass-panel group overflow-hidden transition-all duration-500 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer ${isFestiveMode ? 'festive-border' : ''}`}>
        <div className="relative">
          <div className={`relative w-full aspect-[1/1] max-w-xs mx-auto ${bgClass} overflow-hidden`}>
             <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
                 <MediaDisplay url={displayImageUrl} altText={productName} type="highlight" priority={true} />
             </div>
             
             {/* Glitter Overlay - Only for NEW items */}
             {isNew && (
                 <div className="absolute inset-0 z-10 pointer-events-none">
                    {glitterParticles}
                 </div>
             )}
          </div>
          
          {/* Festive Ribbon for Highlight - Always shown in Festive Mode */}
          {isFestiveMode && (
              <div className="festive-ribbon">
                 SIGNATURE
              </div>
          )}

          {/* Standard Badge (Hidden in Festive Mode) */}
          {!isFestiveMode && (
            <div className="absolute top-3 left-3 z-20">
                <span className="relative inline-flex items-center py-1.5 px-4 rounded-full text-sm font-semibold bg-yellow-400/80 backdrop-blur-sm text-yellow-900 shadow-md">
                <span className="mr-1.5 animate-pulse-emoji relative z-10">✨</span>
                <span className="relative z-10">{getTranslation('highlightTag')}</span>
                </span>
            </div>
          )}

          {isPromo && (
             <div className="absolute top-3 right-3 z-20">
                <span className="relative inline-flex items-center py-1.5 px-4 rounded-full text-sm font-semibold bg-red-600/80 backdrop-blur-sm text-white shadow-md">
                SPECIAL PRICE
                </span>
            </div>
          )}
        </div>
        <div className="p-4 relative">
          <h3 className={`text-xl font-semibold text-center mb-2 ${isFestiveMode ? 'font-serif-festive text-neutral-800' : 'heading-font'}`}>
            {productName}
          </h3>
          <div className="text-center">
            <p className="text-base flex items-baseline justify-center gap-2 flex-wrap">
              <span>{getTranslation('fromPrice')}</span>
              {isPromo ? (
                <>
                  <span className="font-bold text-2xl text-[var(--day-accent)]">
                    ฿{productGroup.minPrice.toFixed(2)}
                  </span>
                  <span className="line-through text-base text-[var(--bdl-text-secondary)]">
                    ฿{productGroup.originalMinPrice?.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-xl">
                  ฿{productGroup.minPrice.toFixed(2)}
                </span>
              )}
            </p>
            <p className="text-[10px] text-[var(--bdl-text-secondary)] mt-1 px-2">{getTranslation('priceDisclaimer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightProductDisplay;
