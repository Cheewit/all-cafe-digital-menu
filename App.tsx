import React, { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format, startOfDay, endOfDay } from 'date-fns';

import { useOrders } from './hooks/useOrders';
import { useAggregates } from './hooks/useAggregates';
import { useHolidays } from './hooks/useHolidays';
import { calculatePreviousPeriod } from './utils/dateUtils';
import { DEFAULT_POLL_MS } from './constants';
import { get, getRowDateTime, getLoginHistory, getBlockedUsers, blockUser, unblockUser, getForcedLogoutTimestamps, forceLogoutSession } from './utils/dataUtils';
import { Order, LoginAttempt, UserRole } from './types';
import { resolveProvinceName } from './utils/provinceResolver';
import { normalizeLang } from './utils/languageUtils';
import { LanguageProvider } from './contexts/LanguageContext';

// Import Components
import Login from './components/Login';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import ViewNavigator, { View } from './components/ViewNavigator';
import StatusAndKpiCard from './components/StatusAndKpiCard';
import SalesPerformanceKpiCard from './components/SalesPerformanceKpiCard';
import BehavioralKpiCard from './components/BehavioralKpiCard';
import OrdersByHourChart from './components/OrdersByHourChart';
import OrdersByDayOfWeekChart from './components/OrdersByDayOfWeekChart';
import DailyOrderTrendChart from './components/DailyOrderTrendChart';
import ProvinceChart from './components/OrdersByDayChart';
import LanguageDistributionChart from './components/LanguageDistributionChart';
import SweetnessMix from './components/SweetnessMix';
import BrowserLanguageChart from './components/BrowserLanguageChart';
import ProductChart from './components/ProductChart';
import FeedbackCard from './components/FeedbackCard';
import RawDataTable from './components/RawDataTable';
import TopProductsPerformanceTable from './components/TopProductsPerformanceTable';
import CategoryPerformanceChart from './components/CategoryPerformanceChart';
import BrandPerformanceChart from './components/BrandPerformanceChart'; // New
import GeminiInsightCard from './components/GeminiInsightCard';
import Card from './components/Card';
import LanguageFilter from './components/LanguageFilter';
import SalesForecastCard from './components/SalesForecastCard';
import PromotionPerformanceTable from './components/PromotionPerformanceTable';
import ScanLocationChart from './components/ScanLocationChart';
import StoreZoneChart from './components/StoreZoneChart';
import Footer from './components/Footer';
import StaffSummaryModal from './components/StaffSummaryModal';

const LoginHistoryCard: React.FC = () => {
    const [history, setHistory] = useState<LoginAttempt[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [forcedLogoutTimestamps, setForcedLogoutTimestamps] = useState<string[]>([]);

    const refreshState = () => {
        setHistory(getLoginHistory());
        setBlockedUsers(getBlockedUsers());
        setForcedLogoutTimestamps(getForcedLogoutTimestamps());
    };

    useEffect(() => {
        refreshState();
        const intervalId = setInterval(refreshState, 5000); // Poll for updates every 5 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const handleForceLogout = (timestamp: string) => {
        forceLogoutSession(timestamp);
        refreshState();
    };

    const handleBlockUser = (username: string) => {
        blockUser(username);
        refreshState();
    };

    const handleUnblockUser = (username: string) => {
        unblockUser(username);
        refreshState();
    };

    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const isSuccess = status === 'SUCCESS';
        const color = isSuccess ? 'text-green-500' : 'text-red-500';
        const text = isSuccess ? 'Success' : 'Failed';
        return <span className={`font-semibold ${color}`}>{text}</span>;
    };

    return (
        <Card span="3">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-base font-semibold leading-6 text-slate-100">Login History & Session Control</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">// Recent access attempts to the system (Max 100 entries)</p>
                </div>
                <button
                    onClick={refreshState}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.006h-4.992v4.992h4.992Z" />
                    </svg>
                    <span>Refresh</span>
                </button>
            </div>
            <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-cyan-400/20 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-slate-800">
                                <thead className="bg-slate-900/80">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-100 sm:pl-6">Timestamp (UTC)</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">User/Role</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Approx. Location</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Status</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-slate-100">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                                    {history.map((log) => {
                                        const isBlocked = blockedUsers.includes(log.role);
                                        const isForcedOut = forcedLogoutTimestamps.includes(log.timestamp);
                                        const isSuccess = log.status === 'SUCCESS';
                                        const isAdmin = log.role.toLowerCase() === 'admin';

                                        return (
                                            <tr key={log.timestamp}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-300 sm:pl-6 font-mono">
                                                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300 font-mono">{log.role}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300 font-mono">{log.location}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono"><StatusBadge status={log.status} /></td>
                                                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isSuccess && (
                                                            <button
                                                                onClick={() => handleForceLogout(log.timestamp)}
                                                                disabled={isForcedOut}
                                                                className="text-xs font-mono px-2 py-1 rounded border border-yellow-600/50 text-yellow-400 hover:bg-yellow-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 transition-colors"
                                                            >
                                                                {isForcedOut ? 'Terminated' : 'Force Logout'}
                                                            </button>
                                                        )}
                                                        {isBlocked ? (
                                                            <button
                                                                onClick={() => handleUnblockUser(log.role)}
                                                                className="text-xs font-mono px-2 py-1 rounded border border-green-600/50 text-green-400 hover:bg-green-900/50 disabled:opacity-50 transition-colors"
                                                            >
                                                                Unblock User
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleBlockUser(log.role)}
                                                                disabled={isAdmin}
                                                                className="text-xs font-mono px-2 py-1 rounded border border-red-600/50 text-red-400 hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 transition-colors"
                                                            >
                                                                Revoke Access
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {history.length === 0 && (
                            <div className="text-center py-12 font-mono text-slate-500">
                                -- No login history recorded --
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export type ActiveFilter = { type: string; value: string | number } | null;
export type Theme = 'dark' | 'light';

const applyFilter = (rows: Order[], filter: ActiveFilter): Order[] => {
  if (!filter) return rows;

  switch (filter.type) {
    case 'language':
      return rows.filter(row => normalizeLang(get(row, 'language') as string) === filter.value);
    case 'browserLanguage':
      return rows.filter(row => String(get(row, 'browserLanguage') || 'Unknown').trim() === filter.value);
    case 'sweetness':
      return rows.filter(row => String(get(row, 'sweetness') || 'N/A').trim() === filter.value);
    case 'product':
      return rows.filter(row => (String(get(row, 'commonNameTH') || get(row, 'nameTH') || 'Unknown').trim()) === filter.value);
    case 'category':
        return rows.filter(row => String(get(row, 'category') || 'Unknown').trim() === filter.value);
    case 'brand': // New Brand Filter
        return rows.filter(row => String(get(row, 'brand') || 'Unknown').trim() === filter.value);
    case 'promotion':
        return rows.filter(row => String(get(row, 'promotionName') || 'N/A').trim() === filter.value);
    case 'province':
      return rows.filter(row => {
        const locationString = get(row, 'approxLocation');
        const province = resolveProvinceName(String(locationString));
        return province === filter.value;
      });
    case 'dayOfWeek':
      return rows.filter(row => {
        const date = getRowDateTime(row);
        return date ? format(date, 'EEE') === filter.value : false;
      });
    case 'hour':
      return rows.filter(row => {
        const date = getRowDateTime(row);
        return date ? date.getHours() === filter.value : false;
      });
    case 'action':
        return rows.filter(row => String(get(row, 'action') || 'N/A').trim() === filter.value);
    case 'scanLocation':
        return rows.filter(row => String(get(row, 'scanLocation') || 'N/A').trim() === filter.value);
    case 'storeZone':
        return rows.filter(row => String(get(row, 'storeZone') || 'N/A').trim() === filter.value);
    default:
      return rows;
  }
};

const Dashboard: React.FC<{ userRole: UserRole, client: string | null, onLogout: () => void }> = ({ userRole, client, onLogout }) => {
  const [pollMs, setPollMs] = useState<number>(DEFAULT_POLL_MS);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
  const [currentView, setCurrentView] = useState<View>('overview');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('baristai-theme') as Theme) || 'dark');
  
  // State for Staff Summary Modal
  const [showStaffModal, setShowStaffModal] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('baristai-theme', theme);
  }, [theme]);
  
  const now = startOfDay(new Date());
  const defaultDateRange: DateRange = { from: now, to: now };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const checkSessionInterval = setInterval(() => {
        const myTimestamp = sessionStorage.getItem('loginTimestamp');
        if (myTimestamp && getForcedLogoutTimestamps().includes(myTimestamp)) {
            onLogout();
        }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkSessionInterval);
  }, [onLogout]);
  
  const handleDateRangeChange = (range?: DateRange) => {
    setDateRange(range);
    setActiveFilter(null);
  };

  const { rows: rawRowsA, loading: loadingA, error: errorA, refresh: refreshA } = useOrders(pollMs, dateRange);
  const { rows: rawRowsB, loading: loadingB, error: errorB } = useOrders(pollMs, isCompareMode ? compareDateRange : undefined);
  
  const { holidays, loading: loadingHolidays } = useHolidays(dateRange, 'TH');

  const previousPeriodDateRange = useMemo(() => 
    isCompareMode ? undefined : calculatePreviousPeriod(dateRange),
    [dateRange, isCompareMode]
  );
  const { rows: rawRowsPrev } = useOrders(pollMs, previousPeriodDateRange);

  // Strict Client-Side Filtering to handle potential API timezone mismatches
  const filterByDateRange = (rows: Order[], range?: DateRange) => {
    if (!rows.length || !range?.from) return rows;
    const from = startOfDay(range.from);
    const to = endOfDay(range.to || range.from);
    
    return rows.filter(row => {
        const date = getRowDateTime(row);
        return date && date >= from && date <= to;
    });
  };

  const rowsA = useMemo(() => filterByDateRange(rawRowsA, dateRange), [rawRowsA, dateRange]);
  const rowsB = useMemo(() => filterByDateRange(rawRowsB, compareDateRange), [rawRowsB, compareDateRange]);
  const rowsPrev = useMemo(() => filterByDateRange(rawRowsPrev, previousPeriodDateRange), [rawRowsPrev, previousPeriodDateRange]);

  const filteredRows = useMemo(() => applyFilter(rowsA, activeFilter), [rowsA, activeFilter]);
  const filteredRowsB = useMemo(() => applyFilter(rowsB, activeFilter), [rowsB, activeFilter]);
  const filteredRowsPrev = useMemo(() => applyFilter(rowsPrev, activeFilter), [rowsPrev, activeFilter]);

  const aggregatesForKpis = useAggregates(filteredRows, dateRange);
  const aggregatesForCharts = useAggregates(rowsA, dateRange); // Unfiltered for filter-source charts
  
  const aggregatesB = useAggregates(rowsB, compareDateRange); // Unfiltered compare data
  const aggregatesB_filtered = useAggregates(filteredRowsB, compareDateRange); // Filtered compare data
  
  const aggregatesPrev = useAggregates(filteredRowsPrev, previousPeriodDateRange);
  
  const dashboardMode = useMemo(() => {
    if (!dateRange?.from) return 'strategic';
    const to = dateRange.to || dateRange.from;
    const diffDays = (to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24);
    return diffDays < 7 ? 'operational' : 'strategic';
  }, [dateRange]);

  const availableLanguages = useMemo(
    () => [...new Set(aggregatesForCharts.byLanguage.map(lang => lang.language))],
    [aggregatesForCharts.byLanguage]
  );
  
  useEffect(() => {
    if (isCompareMode && !compareDateRange) {
      setCompareDateRange(calculatePreviousPeriod(dateRange));
    }
    if (!isCompareMode) {
      setCompareDateRange(undefined);
    }
  }, [isCompareMode, dateRange, compareDateRange]);
  
  const isLoading = (loadingA || loadingB || loadingHolidays) && aggregatesForCharts.totalOrders === 0;

  const renderContentForView = () => {
    switch(currentView) {
      case 'security':
        return userRole === 'admin' ? <LoginHistoryCard /> : null;
      case 'sales': {
         const provincesForFilter = Object.keys(aggregatesForCharts.byProvince)
            .filter(p => p !== 'ไม่ทราบจังหวัด' && p !== 'Unknown Province')
            .sort();
            
        return (
          <>
            <SalesPerformanceKpiCard 
              aggregatesA={aggregatesForKpis}
              aggregatesB={isCompareMode ? aggregatesB_filtered : undefined}
              aggregatesPrev={!isCompareMode ? aggregatesPrev : undefined}
            />
            <SalesForecastCard 
                rows={rowsA}
                topProducts={aggregatesForCharts.topProducts}
                provinces={provincesForFilter}
                holidays={holidays}
            />
            <LanguageFilter
                availableLanguages={availableLanguages}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <TopProductsPerformanceTable
                aggregatesA={aggregatesForKpis}
                aggregatesB={isCompareMode ? aggregatesB_filtered : undefined}
                aggregatesPrev={!isCompareMode ? aggregatesPrev : undefined}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <PromotionPerformanceTable
                aggregatesA={aggregatesForKpis}
                aggregatesB={isCompareMode ? aggregatesB_filtered : undefined}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScanLocationChart
                    data={aggregatesForKpis.byScanLocation}
                    compareData={isCompareMode ? aggregatesB_filtered.byScanLocation : undefined}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
                <StoreZoneChart
                    data={aggregatesForKpis.byStoreZone}
                    compareData={isCompareMode ? aggregatesB_filtered.byStoreZone : undefined}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            </div>
            {/* Added Brand Performance Chart here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BrandPerformanceChart 
                    data={aggregatesForKpis.byBrand}
                    compareData={isCompareMode ? aggregatesB_filtered.byBrand : undefined}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
                <CategoryPerformanceChart 
                    data={aggregatesForKpis.byCategory} 
                    compareData={isCompareMode ? aggregatesB_filtered.byCategory : undefined} 
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductChart 
                    data={aggregatesForKpis.topProducts.slice(0, 5)} 
                    compareData={isCompareMode ? aggregatesB_filtered.topProducts.slice(0, 5) : undefined} 
                />
                 {dashboardMode === 'operational' && !isCompareMode ? (
                  <DailyOrderTrendChart data={aggregatesForKpis.byDate} holidays={holidays} />
                ) : (
                  <OrdersByDayOfWeekChart data={aggregatesForKpis.byDayOfWeek} compareData={isCompareMode ? aggregatesB_filtered.byDayOfWeek : undefined} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                )}
            </div>
            <div className="grid grid-cols-1 gap-6">
                 <OrdersByHourChart data={aggregatesForKpis.byHour} compareData={isCompareMode ? aggregatesB_filtered.byHour : undefined} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>
            <ProvinceChart byProvince={aggregatesForKpis.byProvince} />
            <RawDataTable rows={filteredRows} />
          </>
        );
      }
      case 'ux':
        return (
            <>
                <BehavioralKpiCard 
                  loading={isLoading}
                  aggregatesA={aggregatesForKpis}
                  aggregatesB={isCompareMode ? aggregatesB_filtered : undefined}
                  aggregatesPrev={!isCompareMode ? aggregatesPrev : undefined}
                />
                <FeedbackCard 
                    aggregatesA={aggregatesForKpis}
                    aggregatesB={isCompareMode ? aggregatesB_filtered : undefined}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <LanguageDistributionChart 
                       data={aggregatesForKpis.byLanguage}
                       compareData={isCompareMode ? aggregatesB_filtered.byLanguage : undefined}
                       activeFilter={activeFilter}
                       onFilterChange={setActiveFilter}
                     />
                    <BrowserLanguageChart 
                        data={aggregatesForKpis.byBrowserLanguage}
                        compareData={isCompareMode ? aggregatesB_filtered.byBrowserLanguage : undefined}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />
                    <SweetnessMix data={aggregatesForKpis.bySweetness} compareData={isCompareMode ? aggregatesB_filtered.bySweetness : undefined} activeFilter={activeFilter} onFilterChange={setActiveFilter}/>
                </div>
            </>
        );
      case 'overview':
      default:
        return (
          <>
            <GeminiInsightCard aggregates={aggregatesForKpis} dateRange={dateRange} userRole={userRole} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                    {dashboardMode === 'operational' && !isCompareMode ? (
                      <DailyOrderTrendChart data={aggregatesForKpis.byDate} holidays={holidays} />
                    ) : (
                      <OrdersByDayOfWeekChart data={aggregatesForKpis.byDayOfWeek} compareData={isCompareMode ? aggregatesB_filtered.byDayOfWeek : undefined} activeFilter={activeFilter} onFilterChange={setActiveFilter}/>
                    )}
                    <OrdersByHourChart data={aggregatesForKpis.byHour} compareData={isCompareMode ? aggregatesB_filtered.byHour : undefined} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>
                <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                    <ProductChart data={aggregatesForKpis.topProducts.slice(0, 5)} compareData={isCompareMode ? aggregatesB_filtered.topProducts.slice(0, 5) : undefined} />
                    <SweetnessMix data={aggregatesForKpis.bySweetness} compareData={isCompareMode ? aggregatesB_filtered.bySweetness : undefined} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>
            </div>
            <ProvinceChart byProvince={aggregatesForKpis.byProvince} />
            <RawDataTable rows={filteredRows} />
          </>
        );
    }
  }

  return (
      <div className="min-h-screen text-slate-300 font-sans">
        <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6 pb-20">
          <Header 
            userRole={userRole}
            client={client}
            onLogout={onLogout}
            dateRange={dateRange}
            compareDateRange={isCompareMode ? compareDateRange : undefined}
            activeFilter={activeFilter}
            onClearFilter={() => setActiveFilter(null)}
            theme={theme}
            setTheme={setTheme}
          />
          <FilterControls
            userRole={userRole}
            onRefresh={refreshA}
            currentInterval={pollMs}
            onIntervalChange={setPollMs}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            compareDateRange={compareDateRange}
            onCompareDateRangeChange={setCompareDateRange}
            isCompareMode={isCompareMode}
            onCompareModeChange={setIsCompareMode}
            rowsForExport={filteredRows}
            onOpenStaffSummary={() => setShowStaffModal(true)} // Pass the handler
          />
          <ViewNavigator currentView={currentView} onViewChange={setCurrentView} userRole={userRole} />
          <StatusAndKpiCard 
            loading={isLoading}
            error={errorA || errorB}
            aggregatesA={aggregatesForKpis}
            aggregatesB={isCompareMode ? aggregatesB_filtered : undefined}
            aggregatesPrev={!isCompareMode ? aggregatesPrev : undefined}
          />
          {renderContentForView()}
        </main>
        
        {/* Render Modal */}
        {showStaffModal && (
            <StaffSummaryModal 
                aggregates={aggregatesForKpis}
                dateRange={dateRange}
                onClose={() => setShowStaffModal(false)}
            />
        )}

        <Footer client={client} />
      </div>
  );
};

function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(() => sessionStorage.getItem('userRole') as UserRole | null);
  const [client, setClient] = useState<string | null>(() => sessionStorage.getItem('clientIdentifier'));
  const [isLoadingAfterLogin, setIsLoadingAfterLogin] = useState(false);

  const handleLogin = (role: UserRole, clientIdentifier?: string) => {
    sessionStorage.setItem('userRole', role);
    setUserRole(role);
    if (clientIdentifier) {
        sessionStorage.setItem('clientIdentifier', clientIdentifier);
        setClient(clientIdentifier);
    }
    setIsLoadingAfterLogin(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('loginTimestamp');
    sessionStorage.removeItem('clientIdentifier');
    setUserRole(null);
    setClient(null);
  };

  const MainContent = () => {
      if (!userRole) {
        return <Login onLogin={handleLogin} />;
      }
      
      if (isLoadingAfterLogin) {
        return <LoadingScreen onLoaded={() => setIsLoadingAfterLogin(false)} />;
      }

      return <Dashboard userRole={userRole} client={client} onLogout={handleLogout} />;
  }

  return (
    <LanguageProvider>
        <MainContent />
    </LanguageProvider>
  );
}

export default App;