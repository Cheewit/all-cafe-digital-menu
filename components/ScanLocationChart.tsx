import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend, Cell } from 'recharts';
import { ActiveFilter } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ChartData {
    name: string;
    count: number;
}
interface ScanLocationChartProps {
    data: ChartData[];
    compareData?: ChartData[];
    activeFilter: ActiveFilter;
    onFilterChange: (filter: ActiveFilter | null) => void;
}

const ScanLocationChart: React.FC<ScanLocationChartProps> = ({ data, compareData, activeFilter, onFilterChange }) => {
    const { t } = useLanguage();
    
    const combinedData = useMemo(() => {
        if (!compareData) {
            return [...data].reverse();
        }
        
        const allNames = new Set([...data.map(p => p.name), ...compareData.map(p => p.name)]);
        
        const combined = Array.from(allNames).map(name => {
            const itemA = data.find(p => p.name === name);
            const itemB = compareData.find(p => p.name === name);
            return {
                name,
                countA: itemA?.count || 0,
                countB: itemB?.count || 0,
            };
        });
        
        return combined.sort((a, b) => a.countA - b.countA);

    }, [data, compareData]);

    const handleBarClick = (payload: any) => {
        if (!payload || !payload.name) return;
        const clickedName = payload.name;
        if (activeFilter?.type === 'scanLocation' && activeFilter.value === clickedName) {
            onFilterChange(null);
        } else {
            onFilterChange({ type: 'scanLocation', value: clickedName });
        }
    };
    
    const isFilterActive = activeFilter?.type === 'scanLocation';
    const ACTIVE_COLOR = '#67e8f9';
    const INACTIVE_COLOR = '#0e7490';
    const DEFAULT_COLOR = '#22d3ee';

    return (
        <div className="h-full relative">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-base font-semibold leading-6 text-slate-100">{t('scansByLocation')}</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">{t('scansByLocationSub')}</p>
                </div>
                 {isFilterActive && (
                    <button
                        onClick={() => onFilterChange(null)}
                        className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                    >
                        &times; {t('clearFilter')}
                    </button>
                )}
            </div>
            {combinedData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-500 font-mono">
                    {t('noDataScanLocation')}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        data={combinedData}
                        layout="vertical"
                        margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                        barGap={compareData ? 2 : undefined}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" horizontal={false} />
                        <XAxis 
                            type="number" 
                            allowDecimals={false}
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#475569' }}
                            stroke="#94a3b8"
                            fontFamily="var(--font-roboto-mono)"
                        />
                        <YAxis 
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fontSize: 11, fill: '#cbd5e1' }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
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
                        {compareData && <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
                        <Bar dataKey={compareData ? "countA" : "count"} name={compareData ? t('periodA') : t('orders')} fill={DEFAULT_COLOR} radius={[0, 4, 4, 0]} barSize={compareData ? 10 : 20} onClick={handleBarClick} style={{cursor: 'pointer'}}>
                           {combinedData.map((entry, index) => {
                                const isActive = isFilterActive && activeFilter!.value === entry.name;
                                const color = isFilterActive ? (isActive ? ACTIVE_COLOR : INACTIVE_COLOR) : DEFAULT_COLOR;
                                return <Cell key={`cell-${index}`} fill={color} opacity={isFilterActive && !isActive ? 0.4 : 1} />;
                            })}
                           {!compareData && <LabelList dataKey="count" position="right" style={{ fill: '#a5f3fc', fontSize: '12px' }} />}
                        </Bar>
                         {compareData && (
                             <Bar dataKey="countB" name={t('periodB')} fill="#67e8f9" radius={[0, 4, 4, 0]} barSize={10} fillOpacity={0.7} onClick={handleBarClick} style={{cursor: 'pointer'}} />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ScanLocationChart;