import React, { useState, useRef, useEffect } from 'react';
import { POLLING_OPTIONS } from '../constants';
import { Order, UserRole } from '../types';
import { exportToExcel } from '../utils/exportUtils';
import { DateRange, DayPicker } from 'react-day-picker';
import { format, isSameDay, startOfDay, subDays, subMonths, subYears } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface FilterControlsProps {
    onRefresh: () => void;
    currentInterval: number;
    onIntervalChange: (interval: number) => void;
    dateRange?: DateRange;
    onDateRangeChange: (range?: DateRange) => void;
    compareDateRange?: DateRange;
    onCompareDateRangeChange: (range?: DateRange) => void;
    isCompareMode: boolean;
    onCompareModeChange: (isCompare: boolean) => void;
    rowsForExport: Order[];
    userRole: UserRole;
    onOpenStaffSummary: () => void; // New Prop
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ReceiptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const buttonClass = (active: boolean = false) => 
    `rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan ` +
    (active ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800');

const DateRangeSelector: React.FC<{
    dateRange?: DateRange;
    onDateRangeChange: (range?: DateRange) => void;
    label: string;
}> = ({ dateRange, onDateRangeChange, label }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [pickerRef]);

    const now = startOfDay(new Date());
    const presets = {
        'Today': { from: now, to: now },
        'Yesterday': { from: subDays(now, 1), to: subDays(now, 1) },
        '7D': { from: subDays(now, 6), to: now },
        '30D': { from: subDays(now, 29), to: now },
        '90D': { from: subDays(now, 89), to: now },
        '1Y': { from: subYears(now, 1), to: now },
    };

    const isPresetActive = (presetKey: keyof typeof presets) => {
        if (!dateRange?.from) return false;
        const preset = presets[presetKey];
        const to = dateRange.to || dateRange.from; // Handle single day selection
        return isSameDay(dateRange.from, preset.from) && isSameDay(to, preset.to);
    }
    
    let rangeDisplay = t('allTime');
    if (dateRange?.from) {
        rangeDisplay = format(dateRange.from, 'd MMM');
        if (dateRange.to && !isSameDay(dateRange.from, dateRange.to)) {
            rangeDisplay += ` - ${format(dateRange.to, 'd MMM')}`;
        }
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500 mr-2 hidden lg:inline">{label}:</span>
            <button onClick={() => onDateRangeChange(presets['Today'])} className={buttonClass(isPresetActive('Today'))}>{t('today')}</button>
            <button onClick={() => onDateRangeChange(presets['Yesterday'])} className={buttonClass(isPresetActive('Yesterday'))}>{t('yesterday')}</button>
            <button onClick={() => onDateRangeChange(presets['7D'])} className={buttonClass(isPresetActive('7D'))}>{t('last7Days')}</button>
            <button onClick={() => onDateRangeChange(presets['30D'])} className={buttonClass(isPresetActive('30D'))}>{t('d30')}</button>
            <button onClick={() => onDateRangeChange(presets['90D'])} className={buttonClass(isPresetActive('90D'))}>{t('d90')}</button>
            <button onClick={() => onDateRangeChange(presets['1Y'])} className={buttonClass(isPresetActive('1Y'))}>{t('y1')}</button>
            <button onClick={() => onDateRangeChange(undefined)} className={buttonClass(!dateRange)}>{t('allTime')}</button>
            <div className="relative" ref={pickerRef}>
                <button onClick={() => setIsPickerOpen(!isPickerOpen)} className={buttonClass()}>
                    <CalendarIcon />
                    <span className="ml-2">{rangeDisplay}</span>
                </button>
                {isPickerOpen && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl">
                        <DayPicker mode="range" selected={dateRange} onSelect={(range) => { onDateRangeChange(range); if (range?.from && range?.to) setIsPickerOpen(false); }} numberOfMonths={2} defaultMonth={dateRange?.from || new Date()} />
                    </div>
                )}
            </div>
        </div>
    );
};


const FilterControls: React.FC<FilterControlsProps> = ({ onRefresh, currentInterval, onIntervalChange, dateRange, onDateRangeChange, compareDateRange, onCompareDateRangeChange, isCompareMode, onCompareModeChange, rowsForExport, userRole, onOpenStaffSummary }) => {
    const { t } = useLanguage();
    
    const handleDownload = () => {
        const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : 'start';
        const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : 'end';
        const fileName = `baristai-eyes-orders_${from}_to_${to}`;
        exportToExcel(rowsForExport, fileName);
    };

    const isGuest = userRole === 'guest';
    
    return (
        <div className="relative z-10 bg-slate-900/50 backdrop-blur-sm border border-cyan-400/10 rounded-2xl p-3 space-y-3">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 flex-wrap">
                <DateRangeSelector dateRange={dateRange} onDateRangeChange={onDateRangeChange} label={t('periodA')} />

                 <div className="flex items-center gap-2 flex-wrap">
                    <span title={isGuest ? "Guest users cannot change refresh rate" : ""}>
                        <select
                            value={currentInterval}
                            onChange={(e) => onIntervalChange(Number(e.target.value))}
                            aria-label="Select refresh interval"
                            disabled={isGuest}
                            className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {POLLING_OPTIONS.map(option => (
                                <option key={option.value} value={option.value} className="bg-slate-800">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </span>
                    <button onClick={onRefresh} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan" title={t('refresh')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5m0-10h5V4M4 20h5v-5" />
                        </svg>
                    </button>
                    
                    {/* New Staff Summary Button */}
                    <button onClick={onOpenStaffSummary} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-800 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan" title={t('staffSummaryBtn')}>
                        <ReceiptIcon />
                        <span className="hidden sm:inline">{t('staffSummaryBtn')}</span>
                    </button>

                    <span title={isGuest ? "Permission Denied: Guest users cannot download data." : t('exportData')}>
                        <button onClick={handleDownload} disabled={rowsForExport.length === 0 || isGuest} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed">
                            <DownloadIcon/>
                        </button>
                    </span>
                 </div>
            </div>

            <div className="border-t border-slate-800/50 my-2"></div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <span className="text-sm font-semibold text-slate-300">{t('compareMode')}</span>
                     <button
                        role="switch"
                        aria-checked={isCompareMode}
                        onClick={() => onCompareModeChange(!isCompareMode)}
                        className={`${isCompareMode ? 'bg-accent-cyan' : 'bg-slate-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-slate-900`}
                    >
                        <span aria-hidden="true" className={`${isCompareMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                    </button>
                </div>
            </div>

            {isCompareMode && (
                 <div className="border-t border-slate-800/50 pt-3">
                    <DateRangeSelector dateRange={compareDateRange} onDateRangeChange={onCompareDateRangeChange} label={t('periodB')} />
                 </div>
            )}
        </div>
    );
};

export default FilterControls;