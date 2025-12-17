
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Screen, LanguageKey, CartItem } from '../types';
import QRCodeDisplay from './QRCodeDisplay';
import MediaDisplay from './MediaDisplay';
import { triggerSuccessHaptic, triggerLightHaptic } from '../utils/haptics';
import { useToast } from '../contexts/ToastContext';
import { GoogleGenAI, Modality } from '@google/genai';

const RatingModal = lazy(() => import('./RatingModal'));
const OutOfStockModal = lazy(() => import('./OutOfStockModal'));

// Sweetness level image map for quick visual confirmation by staff.
const sweetnessImages: { [key: string]: string } = {
  '125': 'https://i.postimg.cc/2SStjVmC/frr.png',
  '100': 'https://i.postimg.cc/k6pvPJh9/1.png',
  '75': 'https://i.postimg.cc/Jz0HKgvJ/75-sweet.png',
  '50': 'https://i.postimg.cc/LYb3F90F/2.png',
  '25': 'https://i.postimg.cc/LYb3F90F/2.png',
  '0': 'https://i.postimg.cc/r0PN2VYX/3.png',
};

// Helper interface for grouped items
interface GroupedCartItem {
  key: string;
  representative: CartItem;
  quantity: number;
  uniqcodes: string[];
  ids: string[]; // All cart IDs in this group
}

const ConfirmationScreen: React.FC = () => {
  const { 
    cart, 
    navigateTo, 
    clearCart, 
    getTranslation, 
    getSizeTranslation, 
    groupedProducts, 
    logEvent, 
    isGeneratingQR, 
    setIsGeneratingQR, 
    omniContext, 
    aiDecision, 
    setAiDecision,
    markOutOfStock,
    removeFromCart,
    selectedLanguage,
  } = useAppContext();

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [loggedItems, setLoggedItems] = useState<Set<string>>(new Set());
  const { showToast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Control flow: Summary -> QR Codes
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  // State for staff-triggered "Out of Stock" action
  // Updated to store IDs to remove, deferring removal until modal interaction
  const [outOfStockModalState, setOutOfStockModalState] = useState<{
      isOpen: boolean; 
      productName: string;
      idsToRemove?: string[];
  }>({ isOpen: false, productName: '' });

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // --- Grouping Logic for Combined QR Codes ---
  const groupedCart = useMemo(() => {
    const groups: Record<string, GroupedCartItem> = {};

    cart.forEach(item => {
      // Create a unique key based on variant and all customizations
      // We sort addons to ensure order doesn't matter
      const addonIds = item.selectedAddons.map(a => a.id).sort().join(',');
      const groupKey = `${item.productGroupId}_${item.variant.Product_Code || item.variant.Name_EN}_${item.selectedSize}_${item.selectedSweetness}_${addonIds}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          representative: item,
          quantity: 0,
          uniqcodes: [],
          ids: []
        };
      }

      groups[groupKey].quantity += 1;
      // Ensure we have a code, fallback to empty string if missing to prevent crash, though should exist.
      groups[groupKey].uniqcodes.push(item.variant.Uniqcode || ''); 
      groups[groupKey].ids.push(item.id);
    });

    return Object.values(groups);
  }, [cart]);
  
  useEffect(() => {
    if (isGeneratingQR) {
      const timer = setTimeout(() => {
        setIsGeneratingQR(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingQR, setIsGeneratingQR]);

  useEffect(() => {
    // Only trigger the rating modal (and subsequent speech) AFTER the user has confirmed the order summary.
    if (isOrderConfirmed && cart.length > 0 && loggedItems.size === 0) {
      triggerSuccessHaptic();
      setIsRatingModalOpen(true);
    }
  }, [isOrderConfirmed, cart.length, loggedItems.size]);
  
  // Effect for weather warning toast
  useEffect(() => {
    const warningShown = sessionStorage.getItem('rainWarningShown');
    if (omniContext?.weather?.toLowerCase().includes('rain') && !warningShown) {
        showToast(getTranslation('weatherWarningRainLater'), 'info');
        sessionStorage.setItem('rainWarningShown', 'true');
    }
  }, [omniContext, showToast, getTranslation]);

  const triggerSpeech = useCallback(async () => {
    const canUseGeminiTTS = ['th', 'my', 'vn'].includes(selectedLanguage);

    // Cancel any ongoing speech first to prevent overlap
    window.speechSynthesis.cancel();
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch (e) { /* ignore */ }
        audioSourceRef.current = null;
    }

    if (!('speechSynthesis' in window) && !canUseGeminiTTS) return;
    if (cart.length === 0) return;

    const textToSpeak = cart.length === 1 
      ? getTranslation('singleItemInstructions') 
      : getTranslation('multipleItemsInstructions');
    
    if (canUseGeminiTTS) {
      // Initialize AudioContext for Gemini if needed
      if (!audioCtxRef.current) {
        try {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        } catch (e) {
            console.error("Could not create AudioContext for TTS", e);
            return;
        }
      }

      setIsSpeaking(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: textToSpeak }] }],
          config: { responseModalities: [Modality.AUDIO] },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio && audioCtxRef.current) {
          const audioCtx = audioCtxRef.current;
          const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
          const source = audioCtx.createBufferSource();
          audioSourceRef.current = source;
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          source.onended = () => { setIsSpeaking(false); audioSourceRef.current = null; };
          source.start();
        } else {
          setIsSpeaking(false);
        }
      } catch (error) {
        console.error("Gemini TTS Error:", error);
        setIsSpeaking(false);
      }
    } else {
      // Web Speech API Fallback
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const langMap: Record<LanguageKey, string> = {
        th: 'th-TH', en: 'en-US', jp: 'ja-JP', zh: 'zh-CN', kr: 'ko-KR',
        my: 'ms-MY', ru: 'ru-RU', fr: 'fr-FR', vn: 'vi-VN', in: 'hi-IN',
      };
      utterance.lang = langMap[selectedLanguage] || 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const setVoiceAndSpeak = () => {
        // Unbind immediately to prevent multiple firings if voices change again
        window.speechSynthesis.onvoiceschanged = null;
        
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
             let bestVoice = voices.find(voice => voice.lang === utterance.lang);
             if (!bestVoice) bestVoice = voices.find(voice => voice.lang.startsWith(selectedLanguage));
             if (bestVoice) utterance.voice = bestVoice;
        }
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
      }
    }
  }, [cart.length, getTranslation, selectedLanguage]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) { /* ignore */ }
        audioSourceRef.current = null;
      }
    };
  }, []);


  const handleRatingComplete = useCallback((feedback: { type: 'like' | 'dislike'; message: string; } | null) => {
    setIsRatingModalOpen(false);
    
    if (cart.length > 0 && loggedItems.size === 0) {
      const newLoggedItems = new Set<string>();
      
      let aiLogData = {};
      if (aiDecision) {
        aiLogData = {
          aiFollowed: aiDecision === 'accepted' ? 'Y' : 'N',
        };
        setAiDecision(null); 
      }
      
      cart.forEach((cartItem) => {
        const productGroup = groupedProducts.find(g => g.id === cartItem.productGroupId);
        if (productGroup) {
          const eventData = newLoggedItems.size === 0 
            ? { cartItem, productGroup, feedback: feedback || undefined, ...aiLogData }
            : { cartItem, productGroup, feedback: feedback || undefined };

          logEvent('ORDER_CONFIRMED', eventData);
          newLoggedItems.add(cartItem.id);
        } else {
          console.error(`Could not find product group for cart item ID ${cartItem.id} to log order.`);
        }
      });
      setLoggedItems(newLoggedItems);
    }
    // Trigger speech exactly once after rating logic completes
    triggerSpeech();
  }, [cart, loggedItems, groupedProducts, logEvent, aiDecision, setAiDecision, triggerSpeech]);

  const handleNewOrder = () => {
    triggerLightHaptic();
    clearCart();
    setLoggedItems(new Set());
    setIsOrderConfirmed(false);
    navigateTo(Screen.Menu);
  };
  
  const activeGroup = groupedCart[0];
  
  const handleQrTap = (index: number = 0) => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
    
    tapCountRef.current += 1;

    if (tapCountRef.current >= 3) {
      // Handle Group removal
      const groupToMark = groupedCart[index];
      if (groupToMark) {
          const group = groupedProducts.find(g => g.id === groupToMark.representative.productGroupId);
          if (group) {
              const productName = group.displayName(selectedLanguage);
              
              // Mark Out of Stock immediately
              markOutOfStock(groupToMark.representative.productGroupId);
              
              // Show Modal AND prepare IDs for removal, but DO NOT remove yet.
              // This prevents the screen from going blank immediately.
              setOutOfStockModalState({ 
                  isOpen: true, 
                  productName,
                  idsToRemove: groupToMark.ids 
              });
          }
      }
      tapCountRef.current = 0;
    } else {
      tapTimerRef.current = window.setTimeout(() => {
        tapCountRef.current = 0;
      }, 800); 
    }
  };

  // Handler to safely remove items and navigate away when modal is closed
  const handleOutOfStockModalClose = useCallback(() => {
      if (outOfStockModalState.idsToRemove) {
          outOfStockModalState.idsToRemove.forEach(id => removeFromCart(id));
      }
      setOutOfStockModalState({ isOpen: false, productName: '' });
      navigateTo(Screen.Menu);
  }, [outOfStockModalState, removeFromCart, navigateTo]);

  const grandTotal = cart.reduce((sum, item) => sum + item.customizedPrice, 0);

  // --- ORDER SUMMARY VIEW (Scrollable) ---
  // We show the individual items list (or grouped list) here. 
  // Let's show grouped to keep it clean.
  if (!isOrderConfirmed && cart.length > 0) {
    return (
        <div className="fixed inset-0 bg-stone-100 pt-[60px] pb-[90px] flex flex-col z-10 animate-fadeIn">
             {/* Header */}
             <div className="px-4 py-3 bg-white shadow-sm z-20 flex items-center justify-between">
                <h2 className="text-xl font-bold heading-font text-neutral-900">{getTranslation('orderSummaryTitle')}</h2>
                <span className="text-sm text-stone-500 font-medium bg-stone-100 px-2 py-1 rounded-md">{cart.length} {getTranslation('totalItemsLabel')}</span>
             </div>

             {/* List */}
             <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {groupedCart.map((groupItem) => {
                    const { representative, quantity, key } = groupItem;
                    const productGroup = groupedProducts.find(g => g.id === representative.productGroupId);
                    const displayName = productGroup ? productGroup.displayName(selectedLanguage) : representative.variant.Name_TH;
                    const totalPriceForGroup = representative.customizedPrice * quantity;

                    return (
                        <div key={key} className="bg-white p-3 rounded-xl shadow-sm border border-stone-200 flex gap-3 items-start">
                            <div className="w-16 h-20 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0 border border-stone-100 relative">
                               <MediaDisplay url={representative.variant.Image_URL} altText="" type="preview" />
                               {quantity > 1 && (
                                 <div className="absolute bottom-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-md">
                                   x{quantity}
                                 </div>
                               )}
                            </div>
                            <div className="flex-grow min-w-0">
                               <div className="flex justify-between items-start gap-2">
                                  <h3 className="font-bold text-sm text-neutral-800 line-clamp-1">{displayName}</h3>
                                  <span className="font-bold text-sm text-[var(--day-accent)] whitespace-nowrap">฿{totalPriceForGroup.toFixed(2)}</span>
                               </div>
                               <div className="mt-1 space-y-0.5">
                                   <p className="text-xs text-stone-500">
                                      <span className="font-medium">{getTranslation((representative.variant.Type || '').toLowerCase())}</span>
                                      <span className="mx-1 text-stone-300">|</span>
                                      <span>{getSizeTranslation(representative.selectedSize)}</span>
                                   </p>
                                   <p className="text-xs text-stone-500">
                                      {getTranslation('sweetnessLabel').replace(' 🍯', '')}: <span className="font-medium text-neutral-700">{representative.selectedSweetness || '0'}%</span>
                                   </p>
                                   {representative.selectedAddons.length > 0 && (
                                       <p className="text-xs text-stone-500 truncate">
                                          + {representative.selectedAddons.map(a=>a.name).join(', ')}
                                       </p>
                                   )}
                               </div>
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* Footer */}
             <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-3 px-1">
                    <span className="font-bold text-lg text-neutral-700">{getTranslation('totalLabel')}</span>
                    <span className="font-bold text-3xl text-[var(--day-accent)]">฿{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                    <button 
                      onClick={() => navigateTo(Screen.Menu)}
                      className="secondary-button py-3 px-4 flex-1 text-sm font-semibold"
                    >
                      {getTranslation('addAnotherItemButton')}
                    </button>
                    <button 
                      onClick={() => setIsOrderConfirmed(true)}
                      className="accent-button py-3 px-4 flex-[2] text-base shadow-lg shadow-emerald-500/20"
                    >
                      {getTranslation('confirmOrderButton')}
                    </button>
                </div>
             </div>
        </div>
    );
  }


  // --- FINAL QR VIEW (Responsive Fit-To-Screen) ---
  
  const renderQRHeader = (isSingle: boolean) => (
    <div className="flex-shrink-0 px-4 pt-2 pb-1 z-20">
        <div className="bg-white/90 backdrop-blur-md py-2 px-4 rounded-2xl shadow-sm border border-white/50 mx-auto w-fit max-w-full">
            <div className="flex items-center gap-2 justify-center">
                <p className="font-bold text-neutral-800 text-sm sm:text-base text-center leading-tight">
                    {getTranslation(isSingle ? 'singleItemInstructions' : 'multipleItemsInstructions')}
                </p>
                {isSpeaking && (
                    <div className="flex gap-1 items-end h-3 flex-shrink-0 ml-1">
                        <span className="w-0.5 bg-[var(--bdl-brand)] animate-speaking-bar" style={{ animationDelay: '0s' }} />
                        <span className="w-0.5 bg-[var(--bdl-brand)] animate-speaking-bar" style={{ animationDelay: '0.2s' }} />
                        <span className="w-0.5 bg-[var(--bdl-brand)] animate-speaking-bar" style={{ animationDelay: '0.4s' }} />
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  // --- Grid View (Multiple Distinct Items/Groups) ---
  // Use groupedCart length to determine view mode.
  if (groupedCart.length > 1) {
    return (
      <div className="fixed inset-0 bg-stone-100 flex flex-col z-50 animate-fadeIn h-[100dvh]">
        <div className="h-[60px] flex-shrink-0" />

        <Suspense fallback={null}>
            {isRatingModalOpen && <RatingModal isOpen={isRatingModalOpen} onComplete={handleRatingComplete} />}
            
            {outOfStockModalState.isOpen && (
                <OutOfStockModal 
                    isOpen={outOfStockModalState.isOpen}
                    onClose={handleOutOfStockModalClose}
                    productName={outOfStockModalState.productName}
                />
            )}
        </Suspense>
        
        {renderQRHeader(false)}

        {/* Responsive Grid Container */}
        <div className="flex-grow px-2 py-2 overflow-y-auto md:overflow-hidden flex flex-col items-center justify-center">
            <div className={`grid w-full max-w-3xl mx-auto gap-2 h-full max-h-full
                ${groupedCart.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1' : ''}
                ${groupedCart.length > 2 && groupedCart.length <= 4 ? 'grid-cols-2 grid-rows-2' : ''}
                ${groupedCart.length > 4 ? 'grid-cols-2 sm:grid-cols-3' : ''}
            `}>
            {groupedCart.map((groupItem, idx) => {
                const { representative, quantity, key, uniqcodes } = groupItem;
                const group = groupedProducts.find(g => g.id === representative.productGroupId);
                const name = group ? group.displayName('th') : representative.variant.Name_TH;
                const typeKey = (representative.variant.Type || '').toLowerCase();
                const sizeCode = getSizeTranslation(representative.selectedSize);
                const sweetnessValue = representative.selectedSweetness;
                const sweetnessText = sweetnessValue ? `${sweetnessValue}%` : getTranslation('none', 'th');
                const addons = representative.selectedAddons.length > 0 ? '+' + representative.selectedAddons.map(a => a.name).join(',') : null;
                
                // Join uniqcodes with commas for the combined QR
                const combinedQrString = uniqcodes.join(',');

                return (
                    <div key={key} className="bg-white p-2 rounded-xl shadow-sm border border-stone-200 relative flex flex-col items-center justify-center h-full min-h-[140px]">
                        {/* Badge */}
                        <div className="absolute top-1 left-1 z-20">
                            <span className="bg-stone-700 text-white font-bold px-1.5 py-0.5 rounded-md text-[10px] shadow-sm">
                                #{idx + 1}
                            </span>
                        </div>
                        
                        {/* Quantity Badge for Grid items */}
                        {quantity > 1 && (
                            <div className="absolute top-1 right-1 z-20">
                                <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded-lg text-xl shadow-md border-2 border-white/20">
                                    x{quantity}
                                </span>
                            </div>
                        )}

                        {/* QR Code */}
                        <div className="flex-grow flex items-center justify-center w-full p-1 max-h-[65%]">
                             <div className="aspect-square h-full max-w-full flex items-center justify-center">
                                <QRCodeDisplay text={combinedQrString} size={256} brand={group?.brand} /> 
                             </div>
                        </div>

                        {/* Compact Details */}
                        <div className="w-full mt-1 text-center">
                            <h3 className="font-bold text-xs text-neutral-800 truncate px-1 leading-tight">{name}</h3>
                            <div className="flex justify-center items-center gap-1 text-[10px] text-stone-500 mt-1 leading-none items-center">
                                <span>{getTranslation(typeKey, 'th')}</span>
                                <span>•</span>
                                <span>{sizeCode}</span>
                                <span className="ml-0.5 bg-yellow-100 text-yellow-900 px-1.5 py-0.5 rounded font-extrabold text-sm border border-yellow-300 shadow-sm">{sweetnessText}</span>
                            </div>
                            {addons && <p className="text-[9px] text-stone-400 truncate mt-0.5">{addons}</p>}
                        </div>
                        
                        <div className="absolute inset-0 z-10" onClick={() => handleQrTap(idx)}></div>
                    </div>
                )
            })}
            </div>
        </div>
         
        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-3 bg-white border-t border-stone-200 z-30 flex justify-center pb-safe-area">
            <button
              onClick={handleNewOrder}
              className="w-full max-w-sm accent-button py-3 px-6 shadow-md text-base"
            >
              {getTranslation('newOrderButton')}
            </button>
        </div>
      </div>
    );
  }

  // --- Single Item View (Responsive Ticket Style) ---
  // If groupedCart length is 1, we show this view (even if quantity is > 1)
  if (groupedCart.length === 1 && activeGroup) {
    const { representative, quantity, uniqcodes } = activeGroup;
    const productGroup = groupedProducts.find(g => g.id === representative.productGroupId);
    const name = productGroup ? productGroup.displayName('th') : representative.variant.Name_TH;
    const typeKey = (representative.variant.Type || '').toLowerCase();
    const typeText = getTranslation(typeKey, 'th');
    const sizeCode = getSizeTranslation(representative.selectedSize);
    const sweetnessValue = representative.selectedSweetness;
    const sweetnessText = sweetnessValue ? `${sweetnessValue}%` : getTranslation('none', 'th');
    const addonsText = representative.selectedAddons.length > 0 ? representative.selectedAddons.map(a => a.name).join(', ') : getTranslation('none', 'th');
    const sweetnessImageUrl = sweetnessImages[sweetnessValue || '0'];
    
    // Combined QR string
    const combinedQrString = uniqcodes.join(',');

    return (
      <div className="fixed inset-0 bg-stone-100 flex flex-col z-50 animate-fadeIn h-[100dvh]">
        <div className="h-[60px] flex-shrink-0" />
        
        <Suspense fallback={null}>
            {isRatingModalOpen && <RatingModal isOpen={isRatingModalOpen} onComplete={handleRatingComplete} />}
            {outOfStockModalState.isOpen && (
                <OutOfStockModal 
                    isOpen={outOfStockModalState.isOpen}
                    onClose={handleOutOfStockModalClose}
                    productName={outOfStockModalState.productName}
                />
            )}
        </Suspense>

        {renderQRHeader(true)}

        {/* Main Ticket Container */}
        <div className="flex-grow px-4 py-2 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full border border-stone-200 relative">
                
                {/* 1. Top: Product Details (Compact) */}
                <div className="flex p-4 gap-3 bg-stone-50 border-b border-stone-100 flex-shrink-0 items-center">
                    <div className="w-16 h-16 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0 border border-stone-200 relative">
                        <MediaDisplay url={representative.variant.Image_URL} altText={name} type="preview" priority={true} />
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-lg text-neutral-800 leading-tight truncate flex-1">{name}</h2>
                            {quantity > 1 && (
                                <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded-lg text-xl shadow-sm flex-shrink-0">
                                    x{quantity} แก้ว
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-stone-600 mt-1 flex flex-wrap gap-x-3 items-center">
                            <span>{typeText}</span>
                            <span>{sizeCode}</span>
                            <span className="flex items-center gap-1">
                                {getTranslation('sweetnessLabel', 'th').replace(' 🍯', '')}: 
                                <span className="bg-yellow-100 text-yellow-900 px-2 py-0.5 rounded-md font-extrabold text-lg border border-yellow-300 shadow-sm">{sweetnessText}</span>
                            </span>
                        </div>
                         {representative.selectedAddons.length > 0 && (
                            <p className="text-[10px] text-stone-500 truncate mt-1">
                                + {addonsText}
                            </p>
                         )}
                    </div>
                    {sweetnessImageUrl && (
                        <div className="w-10 flex-shrink-0 flex items-center justify-center opacity-80">
                            <img src={sweetnessImageUrl} alt="" className="max-w-full h-auto object-contain" />
                        </div>
                    )}
                </div>

                {/* 2. Middle: Hero QR Code (Flexible Height) */}
                <div 
                    className="flex-grow flex flex-col items-center justify-center p-6 bg-white relative"
                    onClick={() => handleQrTap(0)}
                >
                     <div className="w-full max-w-[280px] aspect-square flex items-center justify-center bg-white p-1">
                        <QRCodeDisplay text={combinedQrString} size={300} brand={productGroup?.brand} />
                     </div>
                     
                     {quantity > 1 ? (
                         <div className="mt-4 text-center">
                             <p className="text-red-600 font-bold text-lg animate-pulse">
                                 ⚠️ {quantity} Items in this QR
                             </p>
                             <p className="text-[10px] text-stone-300 italic mt-1">{getTranslation('staffTapHint')}</p>
                         </div>
                     ) : (
                         <p className="text-[10px] text-stone-300 mt-4 italic">{getTranslation('staffTapHint')}</p>
                     )}
                </div>

            </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-md border-t border-stone-200 z-30 pb-safe-area">
            <button
                onClick={handleNewOrder}
                className="w-full accent-button py-3 px-6 shadow-lg text-lg"
            >
                {getTranslation('newOrderButton')}
            </button>
        </div>
      </div>
    );
  }

  return null; // Fallback
};

// Audio decoding utilities for Gemini TTS
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default ConfirmationScreen;
