// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Product, ProductGroup, Screen } from '../types';
import MediaDisplay from './MediaDisplay';
import { triggerLightHaptic } from '../utils/haptics';

interface ProductCardProps {
  id?: string; // Added optional ID
  productGroup: ProductGroup;
  activeCategory: string;
  activeType?: string;
  isAiRecommended?: boolean;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, productGroup, activeCategory: _activeCategory, activeType = 'all', isAiRecommended = false, priority = false }) => {
  const { navigateTo, getTranslation, selectedLanguage, outOfStockItems, isFestiveMode } = useAppContext();

  const isOutOfStock = outOfStockItems.has(productGroup.id);

  const { displayImageUrl, displayedVariantType } = useMemo(() => {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 17 || currentHour < 5;
    
    // Default priority
    let priorityOrder = isEvening ? ['hot', 'iced', 'frappe'] : ['iced', 'frappe', 'hot'];

    // If a specific type filter is active, prioritize that type to show relevant image/price
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
    return {
      displayImageUrl: foundVariant?.Image_URL || productGroup.image || '',
      displayedVariantType: foundVariant?.Type.toLowerCase() || 'all',
    };
  }, [productGroup, activeType]);

  const productName = productGroup.displayName(selectedLanguage);

  // Brand Logic
  const isAllSelect = useMemo(() => {
      const b = productGroup.brand?.toLowerCase().trim() || '';
      return b.includes('all select') || b.includes('allselect');
  }, [productGroup.brand]);

  // Brand Logo Logic
  const brandLogoUrl = useMemo(() => {
    if (!productGroup.brand) return null;
    const b = productGroup.brand.toLowerCase().trim();
    if (b.includes('all cafe') || b.includes('allcafe')) {
       return isFestiveMode 
         ? 'https://i.postimg.cc/ydk08yw2/chritmas-logo.png'
         : 'https://i.postimg.cc/qgfsNBYW/all_cafe_logo.png';
    }
    if (b.includes('all select') || b.includes('allselect')) {
       return 'https://i.postimg.cc/jSMh7QYM/Untitled-design.jpg';
    }
    return null;
  }, [productGroup.brand, isFestiveMode]);

  // Random Festive Micro-Decoration Logic
  const randomFestiveDecoration = useMemo(() => {
    const decos = ['🎄', '✨', '🔔', '🎅', '🎁', '🦌', '⭐', '🧸', '🎻'];
    return decos[Math.floor(Math.random() * decos.length)];
  }, []);
  
  // Random glitter particles (Applied to ALL themes)
  const glitterParticles = useMemo(() => {
      return Array.from({ length: 6 }).map((_, i) => {
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
                      boxShadow: '0 0 2px currentColor'
                  }} 
              />
          );
      });
  }, []);

  const handleCardClick = () => {
    if (isOutOfStock) return;
    triggerLightHaptic();
    navigateTo(Screen.Customization, productGroup, displayedVariantType);
  };

  const getTagColor = (tagType: string) => {
    const lowerType = tagType.toLowerCase();
    if (lowerType === 'hot') return 'bg-red-600/80 text-white';
    if (lowerType === 'iced') return 'bg-sky-500/80 text-white';
    if (lowerType === 'frappe') return 'bg-purple-500/80 text-white';
    return 'bg-gray-500/80 text-white';
  };

  const { signatureTagToDisplay, isNew } = useMemo(() => {
    const signatureTagsInPriority = ['7-eleven signature', 'signature from thailand', 'signature'];
    const originalTags = productGroup.tags.split(',').map(t => t.trim());
    const lowercasedTags = originalTags.map(t => t.toLowerCase());
    
    let tag: string | null = null;
    const isNewItem = productGroup.tags.toLowerCase().includes('new');

    for (const priorityTag of signatureTagsInPriority) {
        const index = lowercasedTags.indexOf(priorityTag);
        if (index !== -1) {
            tag = originalTags[index];
            break;
        }
    }
    return { signatureTagToDisplay: tag, isNew: isNewItem };
  }, [productGroup.tags]);

  const uniqueTypes = Array.from(new Set(productGroup.variants.map(v => v.Type).filter(Boolean)));
  const isPromo = productGroup.originalMinPrice && productGroup.originalMinPrice > productGroup.minPrice;

  // Background Logic
  let cardBackgroundClass;
  if (isFestiveMode) {
      cardBackgroundClass = 'festive-card-bg';
  } else {
      cardBackgroundClass = isAllSelect 
        ? 'bg-gradient-to-b from-[#E0EAFC] to-[#CFDEF3]' 
        : 'bg-gradient-to-b from-stone-200 to-stone-300';
  }

  // Determine if card has any active badges that would occupy corners
  // Badges occupy Top Left (AI, New, Promo) or Top Right (Ribbon, Signature)
  const hasActiveBadges = isAiRecommended || signatureTagToDisplay || isNew || isPromo;

  return (
    <div
      id={id}
      className={`glass-panel group overflow-hidden transition-all duration-500 ease-in-out flex flex-col relative ${isOutOfStock ? 'opacity-50' : 'hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer'} ${isAiRecommended && !isOutOfStock ? 'glow-animation' : ''} ${isFestiveMode ? 'festive-border' : ''}`}
      onClick={handleCardClick}
      aria-disabled={isOutOfStock}
    >
      <div className={`relative w-full aspect-[3/4] ${cardBackgroundClass} overflow-hidden`}>
        
        {/* Image container with zoom effect on group hover */}
        <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
            <MediaDisplay url={displayImageUrl} altText={productName} type="card" priority={priority} />
        </div>
        
        {/* Glitter Overlay - Only for NEW items */}
        {!isOutOfStock && isNew && (
            <div className="absolute inset-0 z-10 pointer-events-none">
                {glitterParticles}
            </div>
        )}
        
        {isOutOfStock && (
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white text-center p-2 z-30 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="font-bold heading-font text-lg">{getTranslation('outOfStock')}</span>
           </div>
        )}

        {isAiRecommended && !isOutOfStock && (
          <div className="absolute top-2 left-2 z-20 bg-emerald-500/80 backdrop-blur-sm text-white font-bold rounded-full shadow-lg px-3 py-1.5 text-xs flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            <span>{getTranslation('aiSenseRecommendation')}</span>
          </div>
        )}
        
        {/* Festive: Use Red/Gold Ribbon for Signature items */}
        {isFestiveMode && signatureTagToDisplay && !isPromo && !isAiRecommended && !isOutOfStock && (
            <div className="festive-ribbon">
               SIGNATURE
            </div>
        )}

        {/* Festive New Item Badge - Animated & Sparkly */}
        {isFestiveMode && !isOutOfStock && isNew && !isAiRecommended && (
           <div className="absolute top-2 left-2 z-20 animate-wiggle">
             <div className="bg-gradient-to-r from-[#722F37] to-[#8B0000] text-[#F0EAD6] border border-[#C5A059] px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
               <span className="text-xs animate-pulse">✨</span>
               <span className="font-serif-festive text-[10px] font-bold tracking-widest">NEW</span>
               <span className="text-xs animate-pulse delay-75">✨</span>
             </div>
           </div>
        )}
        
        {/* Standard NEW ARRIVAL Badge - NOW WITH WIGGLE & SPARKLE */}
        {!isFestiveMode && isNew && !isOutOfStock && !isAiRecommended && (
            <div className="absolute top-2 left-2 z-20 animate-wiggle">
                 <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-lg border border-white/30 backdrop-blur-sm flex items-center gap-1">
                    <span className="animate-pulse">✨</span>
                    NEW ARRIVAL
                    <span className="animate-pulse delay-75">✨</span>
                 </div>
            </div>
        )}

        {isPromo && !isAiRecommended && !isOutOfStock && !isNew && (
          <div className="absolute z-10 backdrop-blur-sm bg-red-600/80 text-white font-bold rounded-lg shadow-lg top-2 left-2 px-2.5 py-1 text-[10px] sm:text-xs">
            SPECIAL PRICE
          </div>
        )}
        
        {/* Standard Signature Badge (Only if NOT festive mode) */}
        {!isFestiveMode && signatureTagToDisplay && !isPromo && !isAiRecommended && !isOutOfStock && (
          <div className="absolute z-10 backdrop-blur-sm bg-black/20 text-white font-bold rounded-lg shadow-lg top-2 right-2 px-2 py-0.5 text-[10px] sm:text-xs">
            {getTranslation(signatureTagToDisplay.toLowerCase()) || signatureTagToDisplay}
          </div>
        )}
        
        {/* Micro Festive Decorations for CLEAN cards (no other badges) */}
        {isFestiveMode && !isOutOfStock && !hasActiveBadges && (
            <div className="absolute top-2 right-2 z-20 text-base filter drop-shadow-sm opacity-90 select-none">
                {randomFestiveDecoration}
            </div>
        )}

        {/* Brand Logo Overlay */}
        {brandLogoUrl && !isOutOfStock && (
          <div className="absolute bottom-1.5 right-1.5 z-20 w-9 h-9 rounded-full shadow-md overflow-hidden bg-white/95 border border-white/40 flex items-center justify-center">
            <img 
              src={brandLogoUrl} 
              alt={productGroup.brand || 'Brand'} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-1 mb-1">
            <h3 className={`text-base font-semibold truncate flex-grow ${isFestiveMode ? 'font-serif-festive tracking-wide text-neutral-800' : 'heading-font'}`}>
                {productName}
            </h3>
        </div>
        <div className="mb-2">
          <p className="text-sm flex items-baseline gap-1.5 flex-wrap">
            <span>{getTranslation('fromPrice')}</span>
            {isPromo ? (
              <>
                <span className="font-bold text-lg text-[var(--day-accent)]">฿{productGroup.minPrice.toFixed(2)}</span>
                <span className="line-through text-sm text-[var(--day-text-secondary)]">฿{productGroup.originalMinPrice?.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-semibold text-base">฿{productGroup.minPrice.toFixed(2)}</span>
            )}
          </p>
        </div>
        <div className="mt-auto flex justify-between items-end">
          <div className="flex flex-wrap gap-1">
            {uniqueTypes.map(type => (
              <span key={type as string} className={`inline-block py-0.5 px-1.5 rounded-full text-xs font-semibold ${getTagColor(type as string)}`}>
                {getTranslation((type as string).toLowerCase()) || (type as string)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);