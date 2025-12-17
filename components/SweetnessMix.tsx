import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { ActiveFilter } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

const getSweetnessLabel = (level: string, t: any): string => {
    const trimmed = (level || "").trim();
    if (trimmed.toLowerCase() === 'n/a') return t('notSpecified');
    if (trimmed.includes('%')) return `${t('sweetnessLevel')} ${trimmed}`;
    if (trimmed.toLowerCase() === 'ปกติ' || trimmed === '1') return `${t('sweetnessLevel')} 100%`;
    if (trimmed === '0') return `${t('sweetnessLevel')} 0%`;
    
    // Fallback for potential numeric values (e.g., 0.5)
    const numeric = parseFloat(trimmed);
    if (!isNaN(numeric) && numeric >= 0 && numeric <= 1) {
        return `${t('sweetnessLevel')} ${numeric * 100}%`;
    }

    return level; // Fallback for any other value
};

interface SweetnessData {
    level: string;
    count: number;
}

interface SweetnessMixProps {
  data: SweetnessData[];
  compareData?: SweetnessData[];
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter | null) => void;
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6} // Explode effect
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ filter: `drop-shadow(0 0 5px ${fill})` }}
            />
        </g>
    );
};


const SinglePieChart: React.FC<{ 
    data: SweetnessData[], 
    title?: string,
    activeFilter?: ActiveFilter;
    onPieClick?: (payload: any) => void;
}> = ({ data, title, activeFilter, onPieClick }) => {
    const COLORS = ['#22d3ee', '#0e7490', '#0891b2', '#67e8f9', '#a5f3fc'];
    const { t } = useLanguage();

    const translatedTitle = title === 'Period A' ? t('periodA') : title === 'Period B' ? t('periodB') : title;

    const chartData = React.useMemo(() => data.map(item => ({
        ...item,
        name: getSweetnessLabel(item.level, t),
    })), [data, t]);
    
    const total = chartData.reduce((sum, item) => sum + (item?.count ?? 0), 0);
    
    const isFilterActiveForThisChart = activeFilter && activeFilter.type === 'sweetness';

    const activeIndex = useMemo(() => {
        if (!isFilterActiveForThisChart) return -1;
        return chartData.findIndex(d => d.level === activeFilter.value);
    }, [isFilterActiveForThisChart, chartData, activeFilter]);

    // Fix: Cast Pie to `any` to allow using the `activeIndex` prop, which is valid but missing from the version's type definitions.
    const PieComponent = Pie as any;

    if (!chartData?.length || total === 0) {
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
                        data={chartData} 
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
                        {chartData.map((entry, index) => {
                             const isThisSliceActive = isFilterActiveForThisChart && activeFilter.value === entry.level;
                            return (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                    opacity={!isFilterActiveForThisChart || isThisSliceActive ? 1 : 0.3}
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
                                        <p className="text-accent-cyan">{`${value.toLocaleString()} orders (${pct}%)`}</p>
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

const SweetnessMix: React.FC<SweetnessMixProps> = React.memo(({ data, compareData, activeFilter, onFilterChange }) => {
  const { t } = useLanguage();
  const handlePieClick = (payload: any) => {
    const clickedLevel = payload.level;
    if (activeFilter && activeFilter.type === 'sweetness' && activeFilter.value === clickedLevel) {
      onFilterChange(null);
    } else {
      onFilterChange({ type: 'sweetness', value: clickedLevel });
    }
  };
  
  const isFilterActiveForThisChart = activeFilter && activeFilter.type === 'sweetness';

  return (
    <div className="h-full relative">
      <div className="mb-2">
        <h3 className="text-base font-semibold leading-6 text-slate-100">{t('sweetnessMix')}</h3>
        <p className="mt-1 text-sm text-slate-400 font-mono">{t('sweetnessMixSub')}</p>
      </div>
       {isFilterActiveForThisChart && (
        <button
            onClick={() => onFilterChange(null)}
            className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
            aria-label="Clear sweetness filter"
        >
            &times; {t('clearFilter')}
        </button>
      )}

      {compareData ? (
        <div className="flex flex-col md:flex-row gap-4 items-center h-[250px]">
            <SinglePieChart data={data} title="Period A" activeFilter={activeFilter} onPieClick={handlePieClick} />
            <SinglePieChart data={compareData} title="Period B" />
        </div>
      ) : (
        <div className="h-[250px]">
          <SinglePieChart data={data} activeFilter={activeFilter} onPieClick={handlePieClick} />
        </div>
      )}
    </div>
  );
});

export default SweetnessMix;