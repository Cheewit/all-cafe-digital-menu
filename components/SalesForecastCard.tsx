import React, { useState } from 'react';
import Card from './Card';
import { Order } from '../types';
import { useForecast } from '../hooks/useForecast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface SalesForecastCardProps {
  rows: Order[];
  topProducts: { name: string; count: number; sales: number; }[];
  provinces: string[];
  holidays: { [key: string]: string }; // Added prop
}

const SalesForecastCard: React.FC<SalesForecastCardProps> = ({ rows, topProducts, provinces, holidays }) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const { t } = useLanguage();

  const { forecast, peakDay, highDemandAlert } = useForecast(rows, selectedProduct, selectedProvince, holidays);

  const hasData = rows.length > 0;

  const getBarColor = (entry: any) => {
      if (entry.impactLevel === 'negative') return '#ef4444'; // Red for low traffic days
      if (entry.impactLevel === 'positive') return '#22c55e'; // Green for high traffic
      return '#22d3ee'; // Default Cyan
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-sm font-mono max-w-[250px] z-50">
          <p className="font-bold text-slate-100 mb-2 border-b border-slate-700 pb-1">
            {format(parseISO(data.date), 'EEEE, d MMM')}
          </p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">Forecast:</span>
            <span className="text-cyan-300 font-bold text-lg">{data.forecast} <span className="text-xs font-normal text-slate-500">{t('units')}</span></span>
          </div>
          
          {data.factors.length > 0 && (
              <div className="mt-2 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Factors:</p>
                  {data.factors.map((factor: string, idx: number) => (
                      <div key={idx} className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700/50">
                          {factor}
                      </div>
                  ))}
              </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card span="3">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold leading-6 text-slate-100 flex items-center gap-2">
              {t('forecastTitle')}
              <span className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded border border-purple-500/30">AI Enhanced</span>
          </h3>
          <p className="mt-1 text-sm text-slate-400 font-mono">{t('forecastSub')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropdowns */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan disabled:opacity-50"
            disabled={!hasData}
          >
            <option value="all">{t('allProducts')}</option>
            {topProducts.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-300 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan disabled:opacity-50"
            disabled={!hasData}
          >
            <option value="all">{t('allProvinces')}</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {!hasData ? (
        <div className="h-[250px] flex items-center justify-center text-slate-500 font-mono">
          {t('notEnoughDataForecast')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(value, index) => {
                    const dataPoint = forecast[index];
                    return dataPoint ? `${dataPoint.day}` : value;
                  }}
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="forecast" radius={[4, 4, 0, 0]}>
                  {forecast.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                  ))}
                  <LabelList dataKey="forecast" position="top" style={{ fill: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }} formatter={(v: any) => Number(v) > 0 ? Number(v) : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Insights Panel */}
          <div className="md:col-span-1 space-y-4">
              
              {/* Alert Box */}
              {peakDay && peakDay.forecast > 0 && (
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 shadow-inner">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        Smart Insights
                    </h4>
                    
                    <div className="mb-4">
                        <p className="text-sm text-slate-300">
                             {t('peakDemandExpected')} <strong className="text-cyan-300">{format(parseISO(peakDay.date), 'EEEE')}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                             Target: {peakDay.forecast} units
                        </p>
                    </div>

                    {/* Show significant factors for the next few days */}
                    <div className="space-y-2">
                         {forecast.filter(d => d.factors.length > 0).slice(0, 3).map((d) => (
                             <div key={d.date} className="text-xs border-l-2 border-slate-600 pl-2 py-1">
                                 <div className="flex justify-between text-slate-400 mb-0.5">
                                     <span>{format(parseISO(d.date), 'EEE d')}</span>
                                     <span className="opacity-50">{d.weatherIcon}</span>
                                 </div>
                                 {d.factors.map((f, i) => (
                                     <div key={i} className={`font-medium ${d.impactLevel === 'negative' ? 'text-red-400' : d.impactLevel === 'positive' ? 'text-green-400' : 'text-slate-300'}`}>
                                         {f}
                                     </div>
                                 ))}
                             </div>
                         ))}
                    </div>
                </div>
              )}

            {highDemandAlert && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                        <p className="font-bold text-red-400 text-xs uppercase">{t('highDemandAlert')}</p>
                        <p className="text-xs text-red-200 mt-1 leading-relaxed">{t('highDemandMessage')}</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SalesForecastCard;