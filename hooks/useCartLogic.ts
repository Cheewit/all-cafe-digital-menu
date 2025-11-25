
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { useState, useCallback } from 'react';
import { CartItem, Product, ProductGroup, Addon } from '../types';

export const useCartLogic = (
  _groupedProducts: ProductGroup[],
  _logEvent: (action: string, data?: any) => Promise<void>,
  setAiDecision: (v: any) => void
) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = async (variant: Product, group: ProductGroup, size: string, sweet: string, addons: Addon[], price: number, qty = 1) => {
    const batchId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString();
    const items: CartItem[] = Array.from({ length: qty }).map((_, i) => ({
      id: `item-${batchId}-${i}`,
      productGroupId: group.id,
      variant,
      quantity: 1,
      selectedSize: size,
      selectedSweetness: sweet,
      selectedAddons: addons,
      customizedPrice: price
    }));

    setCart(prev => [...prev, ...items]);
    
    // Note: ITEM_ADDED log removed to prevent duplicate rows in the spreadsheet.
    // Data is now only logged upon ORDER_CONFIRMED.

    return items;
  };

  const removeFromCart = useCallback((id: string) => {
    // Removed ITEM_REMOVED logEvent to reduce row count
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    // Removed CART_CLEARED logEvent to reduce row count
    setCart([]);
    setAiDecision(null);
  }, [setAiDecision]);

  return { cart, addToCart, removeFromCart, clearCart };
};
