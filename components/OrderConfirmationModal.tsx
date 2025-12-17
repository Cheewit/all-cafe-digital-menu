// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_GLASS_CODE_SIG
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Addon } from '../types';
import MediaDisplay from './MediaDisplay';
import { triggerLightHaptic } from '../utils/haptics';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderDetails: {
    productName: string;
    imageUrl: string;
    type: string;
    rawType: string;
    size: string;
    sweetness: string;
    addons: Addon[];
    totalPrice: number;
    isPromo: boolean;
  } | null;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, onClose, onConfirm, orderDetails }) => {
  const { getTranslation } = useAppContext();

  if (!isOpen || !orderDetails) return null;

  const { productName, imageUrl, type, size, sweetness, addons, totalPrice, isPromo } = orderDetails;
  
  const handleConfirmClick = () => {
    triggerLightHaptic();
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start md:items-center z-[100] p-4 pt-24 md:pt-4 animate-fadeIn" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="order-confirmation-title"
    >
      <div 
        className="glass-panel max-w-sm w-full flex flex-col max-h-full animate-scaleUpWiggle relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 flex-shrink-0 border-b border-[var(--bdl-glass-border)]">
          <h2 id="order-confirmation-title" className="text-2xl font-bold heading-font text-center mb-2">
            {getTranslation('orderConfirmationTitle')}
          </h2>
          <p className="text-center text-sm text-[var(--bdl-text-secondary)]">{getTranslation('orderConfirmationReview')}</p>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-row gap-4 mb-4">
            <div className="w-1/3 flex-shrink-0">
              <div className="aspect-[3/4] bg-black/10 rounded-lg overflow-hidden shadow-sm">
                <MediaDisplay url={imageUrl} altText={productName} type="preview" priority={true} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold heading-font mb-2">{productName}</h3>
              <div className="space-y-1 text-sm border-t border-[var(--bdl-glass-border)] pt-2">
                <p><strong>{getTranslation('typeLabel')}:</strong> {type}</p>
                <p><strong>{getTranslation('sizeLabel')}:</strong> {size}</p>
                <p><strong>{getTranslation('sweetnessLabel')}:</strong> {sweetness}</p>
                <p><strong>{getTranslation('addonLabel')}:</strong> {addons.length > 0 ? addons.map(a => a.name).join(', ') : getTranslation('none')}</p>
              </div>
            </div>
          </div>
          
          {isPromo && (
            <div className="mb-4 p-3 bg-yellow-100/80 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg" role="alert">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold">
                    {getTranslation('priceDisclaimer')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="text-center text-xl font-bold p-3 bg-[rgba(0,0,0,0.05)] rounded-lg border-2 border-dashed border-[var(--bdl-glass-border)]">
              <span>{getTranslation('totalLabel')}:</span>
              <span className="text-[var(--day-accent)] ml-2">฿{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-4 flex-shrink-0 border-t border-[var(--bdl-glass-border)]">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="w-full secondary-button py-3 px-4"
            >
              {getTranslation('backToEditButton')}
            </button>
            <button
              onClick={handleConfirmClick}
              className="w-full accent-button py-3 px-4"
            >
              {getTranslation('confirmAndGetQRButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;