import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface ProvinceData {
    name: string;
    count: number;
}
interface ProvinceChartProps {
    byProvince: { [key: string]: number };
}

const ProvinceChart: React.FC<ProvinceChartProps> = ({ byProvince }) => {
    const { t } = useLanguage();

    const chartData: ProvinceData[] = useMemo(() => {
        return Object.entries(byProvince)
            .map(([name, count]) => ({ name, count: Number(count) }))
            .filter(item => item.name !== 'ไม่ทราบจังหวัด' && item.name !== 'Unknown Province') 
            .sort((a, b) => b.count - a.count)
            .slice(0, 15)
            .reverse();
    }, [byProvince]);
    
    const DEFAULT_COLOR = '#22d3ee';

    return (
        <div className="h-full relative">
            <div className="mb-2">
                <h3 className="text-base font-semibold leading-6 text-slate-100">{t('top15Provinces')}</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">{t('top15ProvincesSub')}</p>
            </div>
            {chartData.length === 0 ? (
                <div className="h-[450px] flex items-center justify-center text-slate-500 font-mono">
                    {t('noGeoData')}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
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
                            width={120}
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
                        />
                        <Bar dataKey="count" name={t('orders')} fill={DEFAULT_COLOR} radius={[0, 4, 4, 0]} barSize={15} animationDuration={500}>
                           <LabelList dataKey="count" position="right" style={{ fill: '#a5f3fc', fontSize: '12px' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ProvinceChart;