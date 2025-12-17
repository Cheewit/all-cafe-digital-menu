
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { ActiveFilter } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

const getLanguageLabel = (lang: string): string => {
    switch(lang?.toLowerCase()) {
        case 'en-us': return 'English (US)';
        case 'th-th': return 'Thai';
        default: return lang || 'Unknown';
    }
}

interface LanguageData {
    language: string;
    count: number;
}
interface LanguageDistributionChartProps {
  data: LanguageData[];
  compareData?: LanguageData[];
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

const SingleLanguagePie: React.FC<{
    data: LanguageData[];
    title?: string;
    activeFilter?: ActiveFilter;
    onPieClick?: (payload: any) => void;
}> = ({ data, title, activeFilter, onPieClick }) => {
    const COLORS = ['#22d3ee', '#a5f3fc', '#0891b2', '#0e7490', '#67e8f9' ];
    const { t } = useLanguage();
    
    const translatedTitle = title === 'Period A' ? t('periodA') : title === 'Period B' ? t('periodB') : title;
    
    const chartData = React.useMemo(() => data.map(item => ({
        ...item,
        name: getLanguageLabel(item.language),
    })), [data]);
    
    const total = chartData.reduce((sum, item) => sum + (item?.count ?? 0), 0);
    
    const isFilterActiveForThisChart = activeFilter && activeFilter.type === 'language';

    const activeIndex = useMemo(() => {
        if (!isFilterActiveForThisChart) return -1;
        return chartData.findIndex(d => d.language === activeFilter.value);
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
                             const isThisSliceActive = isFilterActiveForThisChart && activeFilter.value === entry.language;
                             return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  style={{ cursor: onPieClick ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
                                  opacity={!isFilterActiveForThisChart || isThisSliceActive ? 1 : 0.3}
                                />
                             )
                        })}
                    </PieComponent>
                    <Tooltip
                        formatter={(value: any, _name: string | undefined, entry: any) => {
                            const { payload } = entry;
                            const pct = total > 0 ? ((payload.count / total) * 100).toFixed(0) : 0;
                            return [`${Number(value).toLocaleString()} users (${pct}%)`, payload.name];
                        }}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1', fontFamily: 'var(--font-roboto-mono)'}}
                        labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

const LanguageDistributionChart: React.FC<LanguageDistributionChartProps> = ({ data, compareData, activeFilter, onFilterChange }) => {
  const { t } = useLanguage();
  const handlePieClick = (payload: any) => {
    const clickedLanguage = payload.language; 
    if (activeFilter && activeFilter.type === 'language' && activeFilter.value === clickedLanguage) {
      onFilterChange(null);
    } else {
      onFilterChange({ type: 'language', value: clickedLanguage });
    }
  };

  const isFilterActiveForThisChart = activeFilter && activeFilter.type === 'language';

  return (
    <div className="h-full relative">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-base font-semibold leading-6 text-slate-100">{t('languageDist')}</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">{t('languageDistSub')}</p>
            </div>
        </div>
        {isFilterActiveForThisChart && (
            <button
                onClick={() => onFilterChange(null)}
                className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                aria-label="Clear language filter"
            >
                &times; {t('clearFilter')}
            </button>
        )}

        {compareData ? (
            <div className="flex flex-col md:flex-row gap-4 items-center h-[250px]">
                <SingleLanguagePie data={data} title="Period A" activeFilter={activeFilter} onPieClick={handlePieClick} />
                <SingleLanguagePie data={compareData} title="Period B" />
            </div>
        ) : (
            <div className="h-[250px]">
                <SingleLanguagePie data={data} activeFilter={activeFilter} onPieClick={handlePieClick} />
            </div>
        )}
    </div>
  );
};

export default LanguageDistributionChart;
