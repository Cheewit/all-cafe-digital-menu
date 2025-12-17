import { useState, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { fetchJSON } from '../services/api';

interface Holiday {
    date: string; // "YYYY-MM-DD"
    localName: string;
    name: string;
    countryCode: string;
    fixed: boolean;
    global: boolean;
    counties: string[] | null;
    launchYear: number | null;
    types: string[];
}

type HolidayMap = { [date: string]: string };

const HOLIDAY_API_BASE = "https://date.nager.at/api/v3/PublicHolidays";

// Cache to store holiday data by year and country to avoid refetching
const holidayCache: { [key: string]: Holiday[] } = {};

export const useHolidays = (dateRange?: DateRange, countryCode: string = 'TH') => {
    const [holidays, setHolidays] = useState<HolidayMap>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const yearsToFetch = useMemo(() => {
        if (!dateRange?.from) return [];
        const fromYear = dateRange.from.getFullYear();
        const toYear = (dateRange.to || dateRange.from).getFullYear();
        const years = new Set<number>();
        for (let y = fromYear; y <= toYear; y++) {
            years.add(y);
        }
        return Array.from(years);
    }, [dateRange]);

    useEffect(() => {
        const fetchHolidays = async () => {
            if (yearsToFetch.length === 0) {
                setHolidays({});
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                const requests = yearsToFetch.map(async (year) => {
                    const cacheKey = `${countryCode}-${year}`;
                    if (holidayCache[cacheKey]) {
                        return holidayCache[cacheKey];
                    }
                    const url = `${HOLIDAY_API_BASE}/${year}/${countryCode}`;
                    const data = await fetchJSON<Holiday[]>(url, { cache: 'force-cache' });
                    holidayCache[cacheKey] = data;
                    return data;
                });

                const results = await Promise.all(requests);
                const combinedHolidays: HolidayMap = {};
                results.flat().forEach(holiday => {
                    combinedHolidays[holiday.date] = holiday.localName;
                });
                
                setHolidays(combinedHolidays);

            } catch (e: any) {
                setError(`Failed to fetch holiday data: ${e.message || String(e)}`);
                // Don't clear old data if fetch fails, just show an error
            } finally {
                setLoading(false);
            }
        };

        fetchHolidays();
    }, [yearsToFetch, countryCode]);

    return { holidays, loading, error };
};
