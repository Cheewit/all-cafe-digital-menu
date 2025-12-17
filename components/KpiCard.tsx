
import React, { useEffect, useState, useRef } from 'react';
import { kpiFlag } from '../utils/kpi';

// --- Helper for CountUp Animation ---
const useCountUp = (end: number, duration: number = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const start = 0; // Or keep track of previous for smoother transitions
        
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Ease-out expo function
            const easeOut = (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            
            setCount(start + (end - start) * easeOut(progress));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }, [end, duration]);

    return count;
};

interface KpiCardProps {
    label: string;
    value: string; // Formatted string, e.g. "฿1,500"
    hint?: string;
    previousValue?: number;
    currentValue?: number; // Raw number for trend calculation
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, hint, previousValue, currentValue }) => {
    const { deltaPct, icon, tone } = kpiFlag(currentValue, previousValue);
    const hasTrendData = deltaPct !== null;
    const [isUpdating, setIsUpdating] = useState(false);
    const prevValRef = useRef(currentValue);

    // Trigger animation when currentValue changes
    useEffect(() => {
        if (prevValRef.current !== currentValue) {
            setIsUpdating(true);
            const timer = setTimeout(() => setIsUpdating(false), 300); // 300ms pulse
            prevValRef.current = currentValue;
            return () => clearTimeout(timer);
        }
    }, [currentValue]);

    const formattedPreviousValue = (val?: number) => {
        if (val === undefined || val === null) return '';
        if (label.toLowerCase().includes('rate')) return `${val.toLocaleString()}%`;
        if (label.toLowerCase().includes('time')) return `${val.toLocaleString()}s`;
        return val.toLocaleString();
    }

    // Dynamic Color Logic
    let valueColor = 'text-accent-cyan';
    let trendColor = 'text-slate-500';
    let bgTint = 'bg-slate-900/30';
    let borderColor = 'border-slate-700/50';
    let shadowColor = 'shadow-transparent';

    if (tone === 'up') {
        valueColor = 'text-green-400';
        trendColor = 'text-green-400';
        bgTint = 'bg-green-900/10'; // Subtle green background
        borderColor = 'border-green-500/20';
        shadowColor = 'shadow-green-500/5';
    } else if (tone === 'down') {
        valueColor = 'text-red-400';
        trendColor = 'text-red-400';
        bgTint = 'bg-red-900/10'; // Subtle red background
        borderColor = 'border-red-500/20';
        shadowColor = 'shadow-red-500/5';
    } else {
        // Neutral / Default
        valueColor = 'text-cyan-400';
        trendColor = 'text-slate-500';
        bgTint = 'bg-slate-900/30';
        borderColor = 'border-slate-700/50';
    }

    const toneSymbol = tone === 'up' ? '▲' : tone === 'down' ? '▼' : '—';

    return (
        <div className={`${bgTint} border ${borderColor} rounded-2xl p-4 h-full flex flex-col justify-between transition-colors duration-500 shadow-lg ${shadowColor}`}>
            <div>
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p 
                        className={`text-3xl font-semibold tabular-nums font-mono [text-shadow:0_0_10px_currentColor] transition-all duration-300 transform origin-left ${valueColor} ${isUpdating ? 'scale-110 brightness-125' : 'scale-100'}`}
                    >
                        {value}
                        {icon && <span className="text-2xl ml-2 align-middle opacity-80">{icon}</span>}
                    </p>
                    {hasTrendData && (
                        <span className={`font-semibold font-mono text-xs inline-flex items-center gap-1 ${trendColor} bg-slate-900/40 px-1.5 py-0.5 rounded`}>
                            {toneSymbol} {Math.abs(deltaPct).toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-mono h-4 flex items-center gap-1">
                {hasTrendData ? (
                    <>
                        <span className="opacity-70">vs.</span> 
                        <span>{formattedPreviousValue(previousValue)}</span>
                    </>
                ) : (
                    <span className="opacity-70">{hint || ' '}</span>
                )}
            </p>
        </div>
    );
};


export default KpiCard;

interface KpiCompareCardProps {
    label: string;
    valueA: number;
    valueB: number;
    formatValue: (value: number) => string;
}

export const KpiCompareCard: React.FC<KpiCompareCardProps> = ({ label, valueA, valueB, formatValue }) => {
    const { deltaPct, icon, tone } = kpiFlag(valueA, valueB);
    const hasTrendData = deltaPct !== null;

    // Use CountUp for the main value
    const animatedValueA = useCountUp(valueA);

    // Dynamic Color Logic
    let valueColor = 'text-accent-cyan';
    let trendColor = 'text-slate-400';
    let bgTint = 'bg-slate-900/30';
    let borderColor = 'border-slate-700/50';

    if (tone === 'up') {
        valueColor = 'text-green-400';
        trendColor = 'text-green-400';
        bgTint = 'bg-green-900/10';
        borderColor = 'border-green-500/20';
    } else if (tone === 'down') {
        valueColor = 'text-red-400';
        trendColor = 'text-red-400';
        bgTint = 'bg-red-900/10';
        borderColor = 'border-red-500/20';
    } else {
        valueColor = 'text-cyan-400';
        trendColor = 'text-slate-400';
        bgTint = 'bg-slate-900/30';
        borderColor = 'border-slate-700/50';
    }
    
    const toneSymbol = tone === 'up' ? '▲' : tone === 'down' ? '▼' : '';

    return (
        <div className={`${bgTint} border ${borderColor} rounded-2xl p-4 h-full flex flex-col justify-between transition-colors duration-500`}>
            <div>
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className={`text-3xl font-semibold tabular-nums font-mono mt-1 [text-shadow:0_0_8px_currentColor] transition-colors duration-300 ${valueColor}`}>
                    {/* Only apply count up to the number part, rely on formatter for symbols */}
                    {formatValue(animatedValueA)}
                    {icon && <span className="text-2xl ml-2 align-middle opacity-80">{icon}</span>}
                </p>
            </div>
            <div className="mt-2 font-mono text-xs flex items-center justify-between">
                <p className="text-slate-500">vs. {formatValue(valueB)}</p>
                {hasTrendData && (
                    <p className={`font-semibold ${trendColor} bg-slate-900/40 px-2 py-0.5 rounded`}>
                        {toneSymbol} {Math.abs(deltaPct).toFixed(1)}%
                    </p>
                )}
            </div>
        </div>
    );
};
