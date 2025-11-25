
// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import { useState, useEffect, useCallback } from 'react';
import { Product, ProductGroup } from '../types';
import { API_URL } from '../constants/app';
import { fetchAllProducts, groupProductsUtil } from '../services/productService';
import { useToast } from '../contexts/ToastContext';

export const useProductLogic = (storeNumber: string | null, getTrans: (k: string) => string) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<Product[]>([]);
  const [grouped, setGrouped] = useState<ProductGroup[]>([]);
  const [highlight, setHighlight] = useState<ProductGroup | null>(null);
  
  // AI & Stock State
  const [aiRecommendation, setAiRecommendation] = useState<ProductGroup | null>(null);
  const [aiDecision, setAiDecision] = useState<'accepted' | 'ignored' | null>(null);
  const [outOfStock, setOutOfStock] = useState<Set<string>>(new Set());

  const preloadImages = (groups: ProductGroup[]) => {
    groups.slice(0, 16).forEach(g => {
      if (g.image) new Image().src = g.image;
    });
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await fetchAllProducts(API_URL, storeNumber);
      setRaw(products);
      const { grouped: g, highlight: h } = groupProductsUtil(products);
      setGrouped(g);
      setHighlight(h);
      setTimeout(() => preloadImages(g), 100);
    } catch (err) {
      console.error(err);
      setError(getTrans('errorLoadingMenu'));
      showToast(getTrans('errorLoadingMenuToast'), 'error');
    } finally {
      setLoading(false);
    }
  }, [storeNumber, getTrans, showToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return {
    productsLoading: loading,
    productsError: error,
    rawProducts: raw,
    groupedProducts: grouped,
    highlightProductGroup: highlight,
    fetchProducts,
    aiRecommendation,
    setAiRecommendation,
    aiDecision,
    setAiDecision,
    outOfStockItems: outOfStock,
    markOutOfStock: useCallback((id: string) => setOutOfStock(s => new Set(s).add(id)), []),
    markInStock: useCallback((id: string) => setOutOfStock(s => { const n = new Set(s); n.delete(id); return n; }), [])
  };
};
