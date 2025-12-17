import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { ActiveFilter } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ActionData {
    name: string;
    count: number;
    [key: string]: any;
}

interface ActionDistributionChartProps {
  data: ActionData[];
  title?: string;
  activeFilter?: ActiveFilter;
  onPieClick?: (payload: any) => void;
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ filter: `drop-shadow(0 0 5px ${fill})` }}
            />
        </g>
    );
};

const ActionDistributionChart: React.FC<ActionDistributionChartProps> = ({ data, title, activeFilter, onPieClick }) => {
    const COLORS = ['#22d3ee', '#0891b2', '#a5f3fc', '#0e7490', '#67e8f9'];
    const { t } = useLanguage();
    
    // Map prop title to translated title if it matches known keys
    const translatedTitle = title === 'Period A' ? t('periodA') : title === 'Period B' ? t('periodB') : title;
    
    const total = data.reduce((sum, item) => sum + (item?.count ?? 0), 0);
    
    const isFilterActiveForThisChart = activeFilter && activeFilter.type === 'action';

    const activeIndex = useMemo(() => {
        if (!isFilterActiveForThisChart) return -1;
        return data.findIndex(d => d.name === activeFilter.value);
    }, [isFilterActiveForThisChart, data, activeFilter]);

    const PieComponent = Pie as any;

    if (!data?.length || total === 0) {
        return (
          <div className="h-full w-full">
            {translatedTitle && <h4 className="text-center text-sm font-semibold text-slate-300 mb-2">{translatedTitle}</h4>}
            <div className="h-[200px] flex items-center justify-center text-slate-500 font-mono">
              {t('noDataAvailable')}
            </div>
          </div>
        );
    }
    
    const renderCustomLabel = ({ percent }: any) => {
        if (percent === 0) return '';
        return `${(percent * 100).toFixed(0)}%`;
    };

    return (
        <div className="w-full h-full">
            {translatedTitle && <h4 className="text-center text-sm font-semibold text-slate-300 mb-2">{translatedTitle}</h4>}
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <PieComponent 
                        data={data} 
                        dataKey="count" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={60} 
                        labelLine={false} 
                        label={renderCustomLabel} 
                        onClick={onPieClick} 
                        animationDuration={800} 
                        animationEasing="ease-out"
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                    >
                        {data.map((entry, index) => {
                             const isThisSliceActive = isFilterActiveForThisChart && activeFilter.value === entry.name;
                            return (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                    opacity={isFilterActiveForThisChart && !isThisSliceActive ? 0.3 : 1}
                                />
                            )
                        })}
                    </PieComponent>
                    <Tooltip
                        cursor={{ fill: 'rgba(34, 211, 238, 0.15)' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0];
                                const value = Number(data.value ?? 0);
                                const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                                return (
                                    <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-2 px-3 text-sm font-mono shadow-lg">
                                        <p className="font-bold text-slate-100 mb-1">{data.name}</p>
                                        <p className="text-accent-cyan">{`${value.toLocaleString()} actions (${pct}%)`}</p>
                                    </div>
                                );
                            }
                            return null;
                        }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ActionDistributionChart;