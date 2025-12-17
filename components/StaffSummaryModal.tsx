
import React, { useRef, useState, useMemo } from 'react';
import { useAggregates } from '../hooks/useAggregates';
import { DateRange } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import html2canvas from 'html2canvas';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

type Aggregates = ReturnType<typeof useAggregates>;

interface StaffSummaryModalProps {
  aggregates: Aggregates;
  dateRange?: DateRange;
  onClose: () => void;
}

const StaffSummaryModal: React.FC<StaffSummaryModalProps> = ({ aggregates, dateRange, onClose }) => {
  const { t } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dateDisplay = dateRange?.from
    ? (dateRange.to && !isSameDay(dateRange.from, dateRange.to)
      ? `${format(dateRange.from, 'd MMM')} - ${format(dateRange.to, 'd MMM yyyy')}`
      : format(dateRange.from, 'd MMMM yyyy'))
    : t('allTime');

  // --- Data Preparation for Smart Charts ---

  // 1. Hourly Traffic Data (Sorted 0-23)
  const hourlyData = useMemo(() => {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map(h => {
          const found = aggregates.byHour.find(item => item.hour === h);
          return { hour: h, orders: found ? found.count : 0 };
      }).filter(h => h.hour >= 6 && h.hour <= 22); // Filter reasonable operating hours for clearer graph
  }, [aggregates.byHour]);

  const peakHourObj = aggregates.byHour.sort((a, b) => b.count - a.count)[0];
  const peakHourTime = peakHourObj ? `${peakHourObj.hour}:00` : '--';

  // 2. Category Data (Top 4 + Others)
  const categoryData = useMemo(() => {
      const sorted = [...aggregates.byCategory].sort((a, b) => b.count - a.count);
      const top4 = sorted.slice(0, 4);
      const others = sorted.slice(4).reduce((acc, curr) => acc + curr.count, 0);
      const result = top4.map(c => ({ name: c.name, value: c.count }));
      if (others > 0) result.push({ name: 'Other', value: others });
      return result;
  }, [aggregates.byCategory]);

  // 3. Zone Data
  const zoneData = useMemo(() => {
      return [...aggregates.byStoreZone]
        .sort((a, b) => b.count - a.count)
        .slice(0, 4) // Top 4 zones
        .map(z => ({ name: z.name, value: z.count }));
  }, [aggregates.byStoreZone]);

  const CHART_COLORS = ['#22d3ee', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

  const handleSaveImage = async () => {
      if (!contentRef.current) return;
      setIsSaving(true);
      try {
          const element = contentRef.current;
          
          // Wait a moment for chart animations to finish/render
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const canvas = await html2canvas(element, {
              backgroundColor: '#0f172a', // Slate-950
              scale: 2, // High resolution
              useCORS: true,
              logging: false,
              // Critical fixes for cutting off content:
              scrollY: -window.scrollY, 
              windowWidth: document.documentElement.offsetWidth,
              height: element.scrollHeight + 20, // Explicitly capture full scroll height + padding
              windowHeight: element.scrollHeight + 100,
              onclone: (clonedDoc) => {
                  // Ensure the cloned element is fully visible and not constrained by viewport
                  const clonedElement = clonedDoc.querySelector('[data-capture-target="true"]') as HTMLElement;
                  if (clonedElement) {
                      clonedElement.style.height = 'auto';
                      clonedElement.style.maxHeight = 'none';
                      clonedElement.style.overflow = 'visible';
                  }
              }
          });
          
          const link = document.createElement('a');
          link.download = `BaristAi-SmartBrief-${format(new Date(), 'yyyyMMdd-HHmm')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      } catch (err) {
          console.error("Failed to capture image:", err);
          alert("Could not save image. Please try taking a screenshot manually.");
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="flex flex-col w-full max-w-4xl max-h-[95vh]">
          
          {/* Main Content Card (Capture Target) */}
          {/* Added data-capture-target attribute for the onclone hook */}
          <div 
            ref={contentRef} 
            data-capture-target="true"
            className="relative bg-slate-900 border-2 border-cyan-400/50 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col overflow-visible"
          >
            
            {/* Header / Branding */}
            <div className="relative p-6 pb-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                             <span className="text-cyan-400">BaristA:i</span> Eyes
                        </h2>
                        <p className="text-slate-400 font-mono text-sm mt-1">{t('staffSummaryTitle')}</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-block px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold font-mono shadow-inner">
                            {dateDisplay}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">Gen: {format(new Date(), 'HH:mm')}</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="p-6 gap-6 bg-slate-900/95 flex flex-col rounded-b-2xl">
                
                {/* Row 1: High Level KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {/* Sales Card */}
                     <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50 relative overflow-hidden">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('totalSales')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                             ฿{aggregates.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                     </div>
                     
                     {/* Digital Orders */}
                     <div className="bg-gradient-to-br from-cyan-900/20 to-slate-900 rounded-xl p-4 border border-cyan-500/30 relative overflow-hidden">
                        <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">{t('digitalOrders')}</p>
                        <p className="text-3xl font-bold text-cyan-300 font-mono tracking-tight">
                             {aggregates.totalOrders.toLocaleString()}
                        </p>
                     </div>

                     {/* Satisfaction */}
                     <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('satisfactionRate')}</p>
                         <div className="flex items-baseline gap-2">
                             <p className="text-2xl font-bold text-green-400 font-mono">{aggregates.likeRate}%</p>
                         </div>
                     </div>
                    
                    {/* AOV */}
                     <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('aovLabel')}</p>
                        <p className="text-2xl font-bold text-slate-200 font-mono">
                            ฿{aggregates.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                     </div>
                </div>

                {/* Row 2: Charts & Menu */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Left: Top Menu List (4 cols) */}
                    <div className="md:col-span-4 bg-slate-800/20 rounded-xl border border-slate-700/30 p-5 flex flex-col">
                        <h3 className="text-slate-100 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="text-yellow-400 text-lg">★</span> {t('topMenu')}
                        </h3>
                        <div className="space-y-3 flex-grow">
                            {aggregates.topProducts.slice(0, 5).map((product, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold font-mono ${idx === 0 ? 'bg-yellow-500 text-slate-900' : idx === 1 ? 'bg-slate-600 text-white' : idx === 2 ? 'bg-slate-700 text-slate-300' : 'text-slate-500 border border-slate-700'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm text-slate-200 font-medium truncate w-[100px]">{product.name}</span>
                                    </div>
                                    <div className="text-right pl-2">
                                        <span className="block text-xs font-mono text-cyan-300 font-bold">{product.count}</span>
                                    </div>
                                </div>
                            ))}
                            {aggregates.topProducts.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-sm">{t('noDataAvailable')}</div>
                            )}
                        </div>
                    </div>

                    {/* Middle: Smart Traffic Pulse (5 cols) */}
                    <div className="md:col-span-5 bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-slate-100 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                                Daily Traffic Pulse
                            </h3>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">PEAK TIME</span>
                                <span className="text-lg font-bold font-mono text-cyan-300 leading-none">{peakHourTime}</span>
                            </div>
                        </div>
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={hourlyData}>
                                    <defs>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis 
                                        dataKey="hour" 
                                        tick={{fill: '#64748b', fontSize: 10}} 
                                        axisLine={false} 
                                        tickLine={false}
                                        interval={3}
                                    />
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px'}}
                                        labelStyle={{color: '#94a3b8', fontSize: '12px'}}
                                        itemStyle={{color: '#22d3ee', fontSize: '12px'}}
                                    />
                                    <Area type="monotone" dataKey="orders" stroke="#22d3ee" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center mt-1">// Real-time order volume by hour</p>
                    </div>

                    {/* Right: Charts Column (3 cols) */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                        
                        {/* Category Donut */}
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-2 w-full text-left">{t('categoryMix')}</h3>
                            <div className="h-[100px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px'}} 
                                            itemStyle={{color: '#fff'}}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-xs font-bold text-slate-300">{categoryData.length}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5 mt-2 w-full">
                                {categoryData.slice(0, 3).map((cat, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: CHART_COLORS[i]}}></div>
                                        <span className="text-[9px] text-slate-400 truncate max-w-[50px]">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Zone Bar */}
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 flex-1">
                             <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-2">{t('zonePerformance')}</h3>
                             <div className="h-[80px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={zoneData} layout="vertical" margin={{left: -15, top:0, bottom:0, right: 10}}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 9, fill: '#94a3b8'}} interval={0} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', fontSize: '10px'}} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 2, 2, 0]} barSize={8} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono rounded-b-2xl">
                <span>BaristA:i Intelligence System</span>
                <span className="text-green-400 font-bold flex items-center gap-1">
                    {t('greatJob')}
                </span>
            </div>
          </div>

          {/* Action Buttons (Outside Capture Zone) */}
          <div className="mt-4 flex gap-3 pb-8">
            <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors border border-slate-700"
            >
                {t('closeBtn')}
            </button>
            <button 
                onClick={handleSaveImage}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-accent-cyan text-slate-900 font-bold hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {t('saveImage')}
                    </>
                )}
            </button>
          </div>
      </div>
    </div>
  );
};

export default StaffSummaryModal;
