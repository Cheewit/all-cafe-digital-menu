import React from 'react';
import KpiCard, { KpiCompareCard } from './KpiCard';
import Diagnostics from './Diagnostics';
import { useAggregates } from '../hooks/useAggregates'; // Only for type definition
import { useLanguage } from '../contexts/LanguageContext';

type Aggregates = ReturnType<typeof useAggregates>;

interface StatusAndKpiCardProps {
    loading: boolean;
    error: string | null;
    aggregatesA: Aggregates;
    aggregatesB?: Aggregates;
    aggregatesPrev?: Aggregates;
}

const StatusAndKpiCard: React.FC<StatusAndKpiCardProps> = ({
    loading,
    error,
    aggregatesA,
    aggregatesB,
    aggregatesPrev,
}) => {
    const { t } = useLanguage();

    if (loading && aggregatesA.totalOrders === 0) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6 flex items-center justify-center h-48">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan"></div>
                    <p className="mt-3 text-slate-400 font-mono">{t('loading')}</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-300">{t('dataFeedInterruption')}</h3>
                <p className="mt-2 text-sm text-red-400 font-mono">{error}</p>
                <p className="mt-2 text-xs text-red-500 font-mono">{t('checkDiagnostics')}</p>
                <div className="mt-4">
                    <Diagnostics />
                </div>
            </div>
        );
    }
    
    const formatCurrency = (val: number) => `฿${val.toLocaleString()}`;
    const formatNumber = (val: number) => val.toLocaleString();
    const formatPercent = (val: number) => `${val}%`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
                <Diagnostics />
            </div>

            {aggregatesB ? (
                <>
                    <KpiCompareCard label={t('totalOrders')} valueA={aggregatesA.totalOrders} valueB={aggregatesB.totalOrders} formatValue={formatNumber} />
                    <KpiCompareCard label={t('totalSales')} valueA={aggregatesA.sales} valueB={aggregatesB.sales} formatValue={formatCurrency} />
                    <KpiCompareCard label={t('likeRate')} valueA={aggregatesA.likeRate} valueB={aggregatesB.likeRate} formatValue={formatPercent} />
                    <KpiCompareCard label={t('notLikeRate')} valueA={aggregatesA.notLikeRate} valueB={aggregatesB.notLikeRate} formatValue={formatPercent} />
                </>
            ) : (
                <>
                    <KpiCard 
                        label={t('totalOrders')} 
                        value={aggregatesA.totalOrders.toLocaleString()}
                        currentValue={aggregatesA.totalOrders}
                        previousValue={aggregatesPrev?.totalOrders}
                    />
                    <KpiCard 
                        label={t('totalSales')} 
                        value={`฿${aggregatesA.sales.toLocaleString()}`}
                        currentValue={aggregatesA.sales}
                        previousValue={aggregatesPrev?.sales}
                    />
                    <KpiCard 
                        label={t('likeRate')} 
                        value={`${aggregatesA.likeRate}%`} 
                        hint={`Based on ${aggregatesA.totalOrders} orders`}
                        currentValue={aggregatesA.likeRate}
                        previousValue={aggregatesPrev?.likeRate}
                    />
                    <KpiCard 
                        label={t('notLikeRate')} 
                        value={`${aggregatesA.notLikeRate}%`}
                        hint={`Based on ${aggregatesA.totalOrders} orders`}
                        currentValue={aggregatesA.notLikeRate}
                        previousValue={aggregatesPrev?.notLikeRate}
                    />
                </>
            )}
        </div>
    );
};

export default StatusAndKpiCard;