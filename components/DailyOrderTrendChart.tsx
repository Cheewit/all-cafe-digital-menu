import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceDot, Label } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface DateData {
    date: string; // "YYYY-MM-DD"
    count: number;
}
interface DailyOrderTrendChartProps {
    data: DateData[];
    holidays: { [key: string]: string }; // Map of "YYYY-MM-DD" to holiday name
}

const CustomTooltipContent = ({ active, payload, label }: any) => {
    const { t } = useLanguage();
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-sm font-mono shadow-lg">
                <p className="font-bold text-slate-100 mb-2">{format(parseISO(label), 'EEEE, d MMM yyyy')}</p>
                <p className="text-accent-cyan">{`${t('orders')}: ${data.count.toLocaleString()}`}</p>
                {data.holidayName && (
                    <p className="text-yellow-400 mt-1">{`🎉 ${data.holidayName}`}</p>
                )}
            </div>
        );
    }
    return null;
};

const DailyOrderTrendChart: React.FC<DailyOrderTrendChartProps> = ({ data, holidays }) => {
    const { t } = useLanguage();
    
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            holidayName: holidays[item.date] || null,
        }));
    }, [data, holidays]);

    const { maxPt, minPt } = useMemo(() => {
        if (!chartData || chartData.length < 3) return { maxPt: null, minPt: null }; // Only show for 3+ data points
        const max = chartData.reduce((a, b) => (b.count > a.count ? b : a), chartData[0]);
        const min = chartData.reduce((a, b) => (b.count < a.count ? b : a), chartData[0]);
        // Avoid marking the same point if all values are equal
        if (max.count === min.count) return { maxPt: null, minPt: null };
        return { maxPt: max, minPt: min };
    }, [chartData]);


    if (!chartData || chartData.length === 0) {
        return (
            <div className="h-full">
                <div className="mb-2">
                    <h3 className="text-base font-semibold leading-6 text-slate-100">{t('dailyOrderTrend')}</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">{t('dailyOrderTrendSub')}</p>
                </div>
                <div className="h-[250px] flex items-center justify-center text-slate-500 font-mono">
                    {t('noDataAvailable')}
                </div>
            </div>
        );
    }
    
    const formatDateTick = (tickItem: string) => {
        if (data.length === 1) return format(parseISO(tickItem), 'd MMM yyyy');
        return format(parseISO(tickItem), 'd MMM');
    };

    return (
        <div className="h-full">
            <div className="mb-2">
                <h3 className="text-base font-semibold leading-6 text-slate-100">{t('dailyOrderTrend')}</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">{t('ordersPerDayAnnotated')}</p>
            </div>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                         <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDateTick}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            stroke="#94a3b8"
                            fontFamily="var(--font-roboto-mono)"
                            interval="preserveStartEnd"
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
                            content={<CustomTooltipContent />}
                        />
                        <Area type="monotone" dataKey="count" stroke="#22d3ee" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} animationDuration={800} />
                        <Line type="monotone" dataKey="count" stroke="#67e8f9" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} animationDuration={800} />
                        
                        {/* Holiday Annotations */}
                        {chartData.map(entry => {
                            if (entry.holidayName) {
                                return (
                                    <ReferenceDot key={entry.date} x={entry.date} y={entry.count} r={8} fill="#facc15" stroke="#0d1117" strokeWidth={2}>
                                         <Label value="🎉" position="top" offset={10} style={{ fontSize: '14px' }} />
                                    </ReferenceDot>
                                );
                            }
                            return null;
                        })}

                        {/* Peak and Trough Annotations */}
                        {maxPt && (
                            <ReferenceDot x={maxPt.date} y={maxPt.count} r={6} fill="#14b8a6" stroke="#0d1117" strokeWidth={2}>
                                <Label value={`${t('peak')}: ${maxPt.count}`} position="top" offset={12} style={{ fill: '#14b8a6', fontSize: '12px', fontFamily: 'var(--font-roboto-mono)' }} />
                            </ReferenceDot>
                        )}
                        {minPt && (
                            <ReferenceDot x={minPt.date} y={minPt.count} r={6} fill="#f43f5e" stroke="#0d1117" strokeWidth={2}>
                                <Label value={`${t('trough')}: ${minPt.count}`} position="bottom" offset={-12} style={{ fill: '#f43f5e', fontSize: '12px', fontFamily: 'var(--font-roboto-mono)' }} />
                            </ReferenceDot>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DailyOrderTrendChart;