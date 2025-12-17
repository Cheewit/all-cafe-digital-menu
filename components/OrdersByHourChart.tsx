import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { ActiveFilter } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface HourData { hour: number; count: number; }

interface OrdersByHourChartProps {
  data: HourData[];
  compareData?: HourData[];
  activeFilter: ActiveFilter | null;
  onFilterChange: (filter: ActiveFilter | null) => void;
}

const OrdersByHourChart: React.FC<OrdersByHourChartProps> = ({
  data, compareData, activeFilter, onFilterChange
}) => {
  const { t } = useLanguage();

  const combinedData = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const a = data.find(d => d.hour === hour)?.count ?? 0;
      const b = compareData?.find(d => d.hour === hour)?.count;
      return { 
        hour, 
        countA: a, 
        ...(compareData ? { countB: b ?? 0 } : {}) 
      };
    });
  }, [data, compareData]);

  const isFilterActiveForThisChart = !!activeFilter && activeFilter.type === 'hour';

  const handleBarClick = (_: any, index: number) => {
    if (index == null || index < 0) return;
    const clickedHour = combinedData[index]?.hour;
    if (clickedHour == null) return;

    if (isFilterActiveForThisChart && activeFilter!.value === clickedHour) {
      onFilterChange(null);
    } else {
      onFilterChange({ type: 'hour', value: clickedHour });
    }
  };
  
  const ACTIVE_COLOR = '#67e8f9';
  const INACTIVE_COLOR = '#0e7490';
  const DEFAULT_COLOR = '#22d3ee';

  if (!data || data.length === 0) {
    return (
        <div className="h-full">
            <div className="mb-2">
                <h3 className="text-base font-semibold leading-6 text-slate-100">{t('ordersByHour')}</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">{t('ordersByHourSub')}</p>
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
        <h3 className="text-base font-semibold leading-6 text-slate-100">{t('ordersByHour')}</h3>
        <p className="mt-1 text-sm text-slate-400 font-mono">{t('ordersByHourSub')}</p>
      </div>

       {isFilterActiveForThisChart && (
        <button
            onClick={() => onFilterChange(null)}
            className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
            aria-label="Clear hour filter"
        >
            &times; {t('clearFilter')}
        </button>
      )}

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={combinedData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
            <XAxis
              dataKey="hour"
              tickFormatter={(h: number) => h.toString().padStart(2, '0')}
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
                fontSize: '0.875rem',
                color: '#cbd5e1',
                fontFamily: 'var(--font-roboto-mono)',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              labelFormatter={(label: number) => `${t('hourLabel')}: ${label.toString().padStart(2, '0')}:00`}
            />

            {compareData && <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />}

            <Bar
              dataKey="countA"
              name={compareData ? t('periodA') : t('orders')}
              radius={[4, 4, 0, 0]}
              style={{ cursor: 'pointer' }}
              onClick={handleBarClick}
              animationDuration={500}
            >
              {combinedData.map((entry, index) => {
                const isActive = isFilterActiveForThisChart && activeFilter!.value === entry.hour;
                const color = isFilterActiveForThisChart ? (isActive ? ACTIVE_COLOR : INACTIVE_COLOR) : DEFAULT_COLOR;
                return <Cell key={`a-${index}`} fill={color} opacity={isFilterActiveForThisChart && !isActive ? 0.4 : 1} />;
              })}
            </Bar>

            {compareData && (
              <Bar
                dataKey="countB"
                name={t('periodB')}
                fill="#67e8f9"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.7}
                onClick={handleBarClick}
                animationDuration={500}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrdersByHourChart;