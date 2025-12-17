import { useState, useEffect, useCallback } from 'react';
import { GAS_ENDPOINT } from '../constants';
import { fetchJSON } from '../services/api';
import { Order } from '../types';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface FetchResponse {
  rows?: Order[];
  data?: Order[];
}

export const useOrders = (pollMs: number, dateRange?: DateRange) => {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Do not fetch if dateRange is explicitly undefined, which can happen in compare mode
    // before a comparison range is selected. An empty dateRange object is fine for "All Time".
    if (dateRange === undefined) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = `${GAS_ENDPOINT}?sheet=OrderAnalytics`;
      if (dateRange?.from) {
        url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}`;
      }
      if (dateRange?.to) {
        url += `&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`;
      }
      
      const json = await fetchJSON<FetchResponse>(url, { timeoutMs: 15000 });
      const arr = json.rows || json.data || [];
      setRows(Array.isArray(arr) ? arr : []);
    } catch (e: any) {
      setError(`Failed to fetch from Google Apps Script: ${e.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, pollMs);
    return () => clearInterval(intervalId);
  }, [fetchData, pollMs]);

  return { rows, loading, error, refresh: fetchData };
};