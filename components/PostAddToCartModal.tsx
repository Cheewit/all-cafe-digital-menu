
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../contexts/AppContext';
import { triggerLightHaptic } from '../utils/haptics';
import { CartItem, Screen } from '../types';
import MediaDisplay from './MediaDisplay';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface PostAddToCartModalProps {
  isOpen: boolean;
  onClose: () => void; // This is the now the "Edit" action
  onConfirm: () => void;
  onAddAnother: () => void;
  item: CartItem | null;
  quantity?: number;
}

const PostAddToCartModal: React.FC<PostAddToCartModalProps> = ({ isOpen, onClose, onConfirm, onAddAnother, item, quantity = 1 }) => {
  const { getTranslation, getSizeTranslation, groupedProducts, selectedLanguage, isFestiveMode } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  // Lock body scroll and screen container scroll when modal is open
  useEffect(() => {
    const toggleScroll = (shouldLock: boolean) => {
      // Lock main body
      document.body.style.overflow = shouldLock ? 'hidden' : '';
      
      // Lock the specific scrolling container for Customization Screen
      const screenContainer = document.getElementById(`screen-${Screen.Customization}`);
      if (screenContainer) {
        screenContainer.style.overflow = shouldLock ? 'hidden' : '';
      }
    };

    if (isOpen) {
      toggleScroll(true);
    }

    return () => {
      toggleScroll(false);
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    triggerLightHaptic();
    onConfirm();
  };
  
  const handleEdit = () => {
    triggerLightHaptic();
    onClose();
  };
  
  const handleAddAnother = () => {
    triggerLightHaptic();
    onAddAnother();
  };

  const productGroup = groupedProducts.find(g => g.id === item.productGroupId);
  const productName = productGroup ? productGroup.displayName(selectedLanguage) : item.variant.Name_EN;
  
  const typeKey = (item.variant.Type || '').toLowerCase();
  const typeText = getTranslation(typeKey) || item.variant.Type;
  const sizeText = getSizeTranslation(item.selectedSize);
  const sweetnessText = item.selectedSweetness ? `${item.selectedSweetness}%` : getTranslation('none');
  const addonsText = item.selectedAddons.length > 0 ? item.selectedAddons.map(a => a.name).join(', ') : getTranslation('none');
  
  const isAllSelect = productGroup?.brand?.toLowerCase().includes('all select') || productGroup?.brand?.toLowerCase().includes('allselect');
  const bgClass = isAllSelect 
    ? 'bg-gradient-to-b from-[#E0EAFC] to-[#CFDEF3]' 
    : 'bg-gradient-to-b from-stone-200 to-stone-300';
    
  const totalBatchPrice = item.customizedPrice * quantity;
  
  // Determine font style for festive mode
  const headerFontClass = isFestiveMode ? 'font-serif-festive tracking-wide' : 'heading-font';

  // Use createPortal to ensure the modal is top-level and not affected by parent transforms/overflows
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999] p-4 animate-fadeIn" 
      onClick={handleEdit} // Closing by clicking the backdrop acts like "Edit"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="confirm-order-modal-title"
      // Ensure it captures touch events to prevent scroll propagation (double safety for mobile)
      onTouchMove={(e) => e.preventDefault()}
    >
      <div 
        ref={modalRef}
        className="glass-panel p-6 max-w-sm w-full flex flex-col max-h-[90vh] animate-scaleUpWiggle relative" 
        onClick={e => e.stopPropagation()}
        // Allow scrolling inside the modal content if needed
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4 flex-shrink-0">
            <h2 id="confirm-order-modal-title" className={`text-2xl font-bold ${headerFontClass}`}>
                {getTranslation('orderConfirmationTitle')}
            </h2>
            <p className="text-sm text-[var(--bdl-text-secondary)] mt-1">
                {getTranslation('orderConfirmationReview')}
            </p>
        </div>

        <div className="overflow-y-auto px-1 py-1 space-y-4 flex-1 min-h-0 filter-scroll">
            {/* Item Summary */}
            <div className="flex items-start gap-4">
              <div className={`w-24 h-32 rounded-lg ${bgClass} overflow-hidden flex-shrink-0 shadow-md`}>
                <MediaDisplay url={item.variant.Image_URL} altText={productName} type="preview" priority={true} />
              </div>
              <div className="flex-grow space-y-1.5 text-sm">
                <p className="font-bold text-lg leading-tight">{productName}</p>
                <p><strong>{getTranslation('typeLabel')}:</strong> {typeText}</p>
                <p><strong>{getTranslation('sizeLabel')}:</strong> {sizeText}</p>
                <p><strong>{getTranslation('sweetnessLabel').replace(' 🍯', '')}:</strong> {sweetnessText}</p>
                <p><strong>{getTranslation('addonLabel')}:</strong> {addonsText}</p>
                {quantity > 1 && (
                   <p className="text-[var(--day-accent)] font-bold pt-1">
                     {getTranslation('quantityLabel')}: {quantity}
                   </p>
                )}
              </div>
            </div>

            {/* Total Price */}
            <div className="border-2 border-dashed border-gray-400/50 rounded-lg p-3 text-center">
                <span className="font-semibold">{getTranslation('totalLabel')}:</span>
                <span className="font-bold text-2xl ml-2 text-[var(--day-accent)]">฿{totalBatchPrice.toFixed(2)}</span>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-yellow-400/30 text-yellow-900 rounded-lg text-xs font-semibold border border-yellow-500/30">
                {getTranslation('priceDisclaimer')}
            </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-6 flex-shrink-0">
          <button onClick={handleConfirm} className="accent-button py-3 px-4 w-full">
            {getTranslation('confirmAndGetQRButton')}
          </button>
          <div className="grid grid-cols-2 gap-3">
              <button onClick={handleAddAnother} className="secondary-button py-3 px-4">
                  {getTranslation('addAnotherItemButton')}
              </button>
              <button onClick={handleEdit} className="secondary-button py-3 px-4">
                  {getTranslation('backToEditButton')}
              </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PostAddToCartModal;
