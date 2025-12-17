
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LabelList } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { ActiveFilter } from '../App';

type BrandData = {
    name: string;
    count: number;
    sales: number;
};

interface BrandPerformanceChartProps {
    data: BrandData[];
    compareData?: BrandData[];
    activeFilter: ActiveFilter;
    onFilterChange: (filter: ActiveFilter | null) => void;
}

const BrandPerformanceChart: React.FC<BrandPerformanceChartProps> = ({ data, compareData, activeFilter, onFilterChange }) => {
    const [metric, setMetric] = useState<'sales' | 'count'>('sales');
    const { t } = useLanguage();
    
    const combinedData = useMemo(() => {
        const allNames = new Set([...data.map(p => p.name), ...(compareData?.map(p => p.name) || [])]);
        
        const combined = Array.from(allNames).map(name => {
            const itemA = data.find(p => p.name === name);
            const itemB = compareData?.find(p => p.name === name);
            return {
                name,
                salesA: itemA?.sales || 0,
                salesB: itemB?.sales || 0,
                countA: itemA?.count || 0,
                countB: itemB?.count || 0,
            };
        });
        
        return combined.sort((a, b) => (a[`${metric}A`] || 0) - (b[`${metric}A`] || 0));

    }, [data, compareData, metric]);

    const handleBarClick = (payload: any) => {
        if (!payload || !payload.name) return;
        const clickedName = payload.name;
        if (activeFilter?.type === 'brand' && activeFilter.value === clickedName) {
            onFilterChange(null);
        } else {
            onFilterChange({ type: 'brand', value: clickedName });
        }
    };

    const buttonClass = (active: boolean) =>
        `rounded-md px-2 py-1 text-xs font-medium transition-colors ` +
        (active ? 'bg-slate-700 text-slate-100' : 'bg-transparent text-slate-400 hover:bg-slate-700/50');
        
    const dataKeyA = metric === 'sales' ? 'salesA' : 'countA';
    const dataKeyB = metric === 'sales' ? 'salesB' : 'countB';
    
    const formatValue = (value: any) => {
        const num = Number(value);
        if (isNaN(num)) return '';
        return metric === 'sales' ? `฿${num.toLocaleString()}` : num.toLocaleString();
    };
    
    const isFilterActive = activeFilter?.type === 'brand';
    const ACTIVE_COLOR = '#67e8f9';
    const INACTIVE_COLOR = '#0e7490';
    const DEFAULT_COLOR = '#22d3ee';

    return (
        <div className="h-full relative">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-base font-semibold leading-6 text-slate-100">{t('perfByBrand')}</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">{t('perfByBrandSub')}</p>
                </div>
                 <div className="flex items-center gap-2">
                    {isFilterActive && (
                        <button
                            onClick={() => onFilterChange(null)}
                            className="text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                        >
                            &times; {t('clearFilter')}
                        </button>
                    )}
                    <div className="flex items-center gap-1 bg-slate-800/70 p-1 rounded-lg">
                        <button onClick={() => setMetric('sales')} className={buttonClass(metric === 'sales')}>{t('sales')}</button>
                        <button onClick={() => setMetric('count')} className={buttonClass(metric === 'count')}>{t('units')}</button>
                    </div>
                </div>
            </div>
            {combinedData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-500 font-mono">
                    {t('noDataAvailable')}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        data={combinedData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
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
                            tickFormatter={value => metric === 'sales' ? `฿${Number(value)/1000}k` : String(value)}
                        />
                        <YAxis 
                            type="category"
                            dataKey="name"
                            width={80}
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
                                fontSize: '0.875rem',
                                color: '#cbd5e1',
                                fontFamily: 'var(--font-roboto-mono)',
                            }}
                             labelStyle={{ color: '#f1f5f9' }}
                             formatter={formatValue}
                        />
                        {compareData && <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
                        <Bar dataKey={dataKeyA} name={t('periodA')} fill={DEFAULT_COLOR} radius={[0, 4, 4, 0]} barSize={compareData ? 10 : 20} animationDuration={500} onClick={(e: any) => e && handleBarClick(e.payload)} style={{cursor: 'pointer'}}>
                            {combinedData.map((entry, index) => {
                                const isActive = isFilterActive && activeFilter!.value === entry.name;
                                const color = isFilterActive ? (isActive ? ACTIVE_COLOR : INACTIVE_COLOR) : DEFAULT_COLOR;
                                return <Cell key={`cell-${index}`} fill={color} opacity={isFilterActive && !isActive ? 0.4 : 1} />;
                            })}
                           {!compareData && <LabelList dataKey={dataKeyA} position="right" style={{ fill: '#a5f3fc', fontSize: '12px' }} formatter={formatValue} />}
                        </Bar>
                        {compareData && (
                             <Bar dataKey={dataKeyB} name={t('periodB')} fill="#67e8f9" radius={[0, 4, 4, 0]} barSize={10} fillOpacity={0.7} animationDuration={500} onClick={(e: any) => e && handleBarClick(e.payload)} style={{cursor: 'pointer'}} />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default BrandPerformanceChart;
