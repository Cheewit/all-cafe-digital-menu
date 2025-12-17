import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface Product {
    name: string;
    count: number;
}
interface ProductChartProps {
    data: Product[];
    compareData?: Product[];
}

const ProductChart: React.FC<ProductChartProps> = ({ data, compareData }) => {
    const { t } = useLanguage();
    
    const combinedData = useMemo(() => {
        if (!compareData) {
            return [...data].reverse();
        }
        
        const allProductNames = new Set([...data.map(p => p.name), ...compareData.map(p => p.name)]);
        
        const combined = Array.from(allProductNames).map(name => {
            const productA = data.find(p => p.name === name);
            const productB = compareData.find(p => p.name === name);
            return {
                name,
                countA: productA?.count || 0,
                countB: productB?.count || 0,
            };
        });
        
        return combined.sort((a, b) => a.countA - b.countA);

    }, [data, compareData]);

    const DEFAULT_COLOR = '#22d3ee';

    return (
        <div className="h-full relative">
            <div className="mb-2">
                <h3 className="text-base font-semibold leading-6 text-slate-100">{t('top5Products')}</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">{t('top5ProductsSub')}</p>
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
                                fontSize: '0.875rem',
                                color: '#cbd5e1',
                                fontFamily: 'var(--font-roboto-mono)',
                            }}
                             labelStyle={{ color: '#f1f5f9' }}
                        />
                        {compareData && <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />}
                        <Bar dataKey={compareData ? "countA" : "count"} name={t('periodA')} fill={DEFAULT_COLOR} radius={[0, 4, 4, 0]} barSize={compareData ? 10 : 20} animationDuration={500}>
                           {!compareData && <LabelList dataKey="count" position="right" style={{ fill: '#a5f3fc', fontSize: '12px' }} />}
                        </Bar>
                        {compareData && (
                             <Bar dataKey="countB" name={t('periodB')} fill="#67e8f9" radius={[0, 4, 4, 0]} barSize={10} fillOpacity={0.7} animationDuration={500} />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ProductChart;