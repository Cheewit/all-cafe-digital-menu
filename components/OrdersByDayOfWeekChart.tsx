import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ActiveFilter } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface DayData {
    day: string;
    count: number;
}
interface OrdersByDayOfWeekChartProps {
    data: DayData[];
    compareData?: DayData[];
    activeFilter: ActiveFilter;
    onFilterChange: (filter: ActiveFilter) => void;
}

const Medals: React.FC<{ rank: number }> = ({ rank }) => {
    const medalColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
    const medalSvgs = [
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8.25c0-1.094-.562-2.062-1.46-2.684a1.5 1.5 0 00-1.922.516l-1.12 2.072M16 8.25V5.75a2.25 2.25 0 00-2.25-2.25H10.5A2.25 2.25 0 008.25 5.75v2.5M16 8.25h-4.25M8.25 8.25h2.25m0 0l-1.12 2.072a1.5 1.5 0 01-1.922.516A3.75 3.75 0 014.5 8.25" />, // 1st
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25h-3.375a.375.375 0 01-.375-.375V4.125a.375.375 0 01.375-.375H15a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25z" />, // 2nd
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h3.75M8.25 12h3.75m-3.75 5.25h3.75M3 3.75c0-1.036.84-1.875 1.875-1.875h13.5A1.875 1.875 0 0121 3.75v16.5c0 1.036-.84 1.875-1.875-1.875h-13.5A1.875 1.875 0 013 20.25V3.75z" /> // 3rd
    ];
    if (rank > 2) return null;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${medalColors[rank]}`}>
            {medalSvgs[rank]}
        </svg>
    );
};


const OrdersByDayOfWeekChart: React.FC<OrdersByDayOfWeekChartProps> = ({ data, compareData, activeFilter, onFilterChange }) => {
    const { t } = useLanguage();
    
    const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const combinedData = useMemo(() => {
        const sourceData = compareData ? dayOrder.map(day => {
            const dayA = data.find(d => d.day === day);
            const dayB = compareData.find(d => d.day === day);
            return { day, countA: dayA?.count || 0, countB: dayB?.count || 0 };
        }) : data;
        
        // Ensure data is always in the correct order of the week
        return [...sourceData].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    }, [data, compareData]);

    const handleBarClick = (payload: any) => {
        if (!payload) return;
        const clickedDay = payload.day;
        if (activeFilter && activeFilter.type === 'dayOfWeek' && activeFilter.value === clickedDay) {
            onFilterChange(null);
        } else {
            onFilterChange({ type: 'dayOfWeek', value: clickedDay });
        }
    };
    
    const isFilterActiveForThisChart = activeFilter && activeFilter.type === 'dayOfWeek';
    const sortedByCount = [...data].sort((a, b) => b.count - a.count);
    const ranks = new Map<string, number>();
    sortedByCount.forEach((d, i) => {
        if (d.count > 0) ranks.set(d.day, i);
    });

    const getBarColor = (day: string) => {
        const ACTIVE_COLOR = '#a5f3fc';
        const INACTIVE_COLOR = '#083344';
        
        if (isFilterActiveForThisChart) {
            return activeFilter.value === day ? ACTIVE_COLOR : INACTIVE_COLOR;
        }

        const RANK_COLORS = ['#67e8f9', '#a5f3fc', '#22d3ee'];
        const DEFAULT_COLOR = '#0e7490';
        const rank = ranks.get(day);
        if (rank !== undefined && rank < 3) {
            return RANK_COLORS[rank];
        }
        return DEFAULT_COLOR;
    };
    
    const topThree = sortedByCount.slice(0, 3).filter(d => d.count > 0);
    const totalOrders = data.reduce((sum, d) => sum + d.count, 0);

    if (!data || totalOrders === 0) {
        return (
            <div className="h-full">
                <div className="mb-2">
                    <h3 className="text-base font-semibold leading-6 text-slate-100">{t('busiestDays')}</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">{t('busiestDaysSub')}</p>
                </div>
                <div className="h-[250px] flex items-center justify-center text-slate-500 font-mono">
                    {t('noDataAvailable')}
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full relative">
            <div className="mb-2">
                <h3 className="text-base font-semibold leading-6 text-slate-100">{t('busiestDays')}</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">{t('busiestDaysSub')}</p>
            </div>
             {isFilterActiveForThisChart && (
                <button
                    onClick={() => onFilterChange(null)}
                    className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                    aria-label="Clear day of week filter"
                >
                    &times; {t('clearFilter')}
                </button>
            )}
            <div className="flex flex-col sm:flex-row h-[250px] gap-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={combinedData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }} onClick={handleBarClick}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
                        <XAxis 
                            dataKey="day"
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
                        <Bar dataKey={compareData ? "countA" : "count"} name={t('periodA')} radius={[4, 4, 0, 0]} style={{cursor: 'pointer'}} animationDuration={500}>
                            {combinedData.map((entry) => {
                                const isThisBarActive = isFilterActiveForThisChart && activeFilter.value === entry.day;
                                return <Cell key={`cell-${entry.day}`} fill={getBarColor(entry.day)} opacity={isFilterActiveForThisChart && !isThisBarActive ? 0.4 : 1} />;
                            })}
                        </Bar>
                         {compareData && <Bar dataKey="countB" name={t('periodB')} fill="#a5f3fc" radius={[4, 4, 0, 0]} fillOpacity={0.6} animationDuration={500} />}
                    </BarChart>
                </ResponsiveContainer>
                {topThree.length > 0 && !compareData && (
                    <div className="w-full sm:w-40 flex-shrink-0 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <h4 className="text-xs font-bold text-slate-300 mb-3 font-mono tracking-wider">{t('top3Days')}</h4>
                        <ul className="space-y-2">
                            {topThree.map((item, index) => (
                                <li key={item.day} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Medals rank={index} />
                                        <span className="font-medium text-slate-300">{item.day}</span>
                                    </div>
                                    <span className="font-mono font-semibold text-cyan-300 tabular-nums">
                                        {item.count.toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersByDayOfWeekChart;