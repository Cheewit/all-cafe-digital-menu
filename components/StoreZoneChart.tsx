import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ActiveFilter } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ChartData {
    name: string;
    count: number;
}
interface StoreZoneChartProps {
    data: ChartData[];
    compareData?: ChartData[];
    activeFilter: ActiveFilter;
    onFilterChange: (filter: ActiveFilter | null) => void;
}

const StoreZoneChart: React.FC<StoreZoneChartProps> = ({ data, compareData, activeFilter, onFilterChange }) => {
    const { t } = useLanguage();
    
    const combinedData = useMemo(() => {
        const allNames = new Set([...data.map(p => p.name), ...(compareData?.map(p => p.name) || [])]);
        
        const combined = Array.from(allNames).map(name => {
            const itemA = data.find(p => p.name === name);
            const itemB = compareData?.find(p => p.name === name);
            return { name, countA: itemA?.count || 0, countB: itemB?.count || 0 };
        });

        return combined.sort((a, b) => b.countA - a.countA); // Sort descending for display
    }, [data, compareData]);

    const handleBarClick = (payload: any) => {
        if (!payload || !payload.name) return;
        const clickedName = payload.name;
        if (activeFilter?.type === 'storeZone' && activeFilter.value === clickedName) {
            onFilterChange(null);
        } else {
            onFilterChange({ type: 'storeZone', value: clickedName });
        }
    };
    
    const isFilterActive = activeFilter?.type === 'storeZone';
    const ACTIVE_COLOR = '#67e8f9';
    const INACTIVE_COLOR = '#0e7490';
    const DEFAULT_COLOR = '#22d3ee';
    
    return (
        <div className="h-full relative">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-base font-semibold leading-6 text-slate-100">{t('scansByStoreZone')}</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">{t('scansByStoreZoneSub')}</p>
                </div>
                {isFilterActive && (
                    <button
                        onClick={() => onFilterChange(null)}
                        className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                        aria-label="Clear store zone filter"
                    >
                        &times; {t('clearFilter')}
                    </button>
                )}
            </div>
            {combinedData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-500 font-mono">
                    {t('noDataStoreZone')}
                </div>
            ) : (
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={combinedData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }} onClick={(e: any) => e && handleBarClick(e.activePayload?.[0]?.payload)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
                            <XAxis 
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                                fontFamily="var(--font-roboto-mono)"
                            />
                            <YAxis 
                                allowDecimals={false}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                                fontFamily="var(--font-roboto-mono)"
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                    borderColor: '#334155',
                                    borderRadius: '0.5rem',
                                    color: '#cbd5e1',
                                    fontFamily: 'var(--font-roboto-mono)',
                                }}
                                labelStyle={{ color: '#f1f5f9' }}
                            />
                            {compareData && <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />}
                            <Bar dataKey={compareData ? "countA" : "count"} name={compareData ? t('periodA') : t('orders')} radius={[4, 4, 0, 0]} style={{cursor: 'pointer'}}>
                                {combinedData.map((entry) => {
                                    const isActive = isFilterActive && activeFilter!.value === entry.name;
                                    const color = isFilterActive ? (isActive ? ACTIVE_COLOR : INACTIVE_COLOR) : DEFAULT_COLOR;
                                    return <Cell key={`cell-${entry.name}`} fill={color} opacity={isFilterActive && !isActive ? 0.4 : 1} />;
                                })}
                            </Bar>
                             {compareData && <Bar dataKey="countB" name={t('periodB')} fill="#a5f3fc" radius={[4, 4, 0, 0]} fillOpacity={0.6} />}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default StoreZoneChart;