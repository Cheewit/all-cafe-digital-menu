
import React from 'react';
import Card from './Card';
import KpiCard, { KpiCompareCard } from './KpiCard';
import { useAggregates } from '../hooks/useAggregates';
import { useLanguage } from '../contexts/LanguageContext';

type Aggregates = ReturnType<typeof useAggregates>;

interface SalesPerformanceKpiCardProps {
  aggregatesA: Aggregates;
  aggregatesB?: Aggregates;
  aggregatesPrev?: Aggregates;
}

const SalesPerformanceKpiCard: React.FC<SalesPerformanceKpiCardProps> = ({ aggregatesA, aggregatesB, aggregatesPrev }) => {
    const { t } = useLanguage();
    const formatCurrency = (val: number) => `฿${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatNumber = (val: number) => val.toLocaleString();
    const formatPercent = (val: number) => `${val}%`;

    return (
        <Card>
            <div className="mb-4">
                <h3 className="text-base font-semibold leading-6 text-slate-100">{t('salesMetrics')}</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">{t('salesMetricsSub')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {aggregatesB ? (
                    <>
                        <KpiCompareCard label={t('totalUnits')} valueA={aggregatesA.totalUnits} valueB={aggregatesB.totalUnits} formatValue={formatNumber} />
                        <KpiCompareCard label={t('avgDailySales')} valueA={aggregatesA.avgDailySales} valueB={aggregatesB.avgDailySales} formatValue={formatCurrency} />
                        <KpiCompareCard label={t('avgOrderValue')} valueA={aggregatesA.avgOrderValue} valueB={aggregatesB.avgOrderValue} formatValue={formatCurrency} />
                        <KpiCompareCard label={t('promotionUsage')} valueA={aggregatesA.promotionUsageRate} valueB={aggregatesB.promotionUsageRate} formatValue={formatPercent} />
                        <KpiCompareCard label={t('totalDiscounts')} valueA={aggregatesA.totalDiscount} valueB={aggregatesB.totalDiscount} formatValue={formatCurrency} />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            label={t('totalUnits')}
                            value={formatNumber(aggregatesA.totalUnits)}
                            currentValue={aggregatesA.totalUnits}
                            previousValue={aggregatesPrev?.totalUnits}
                        />
                         <KpiCard 
                            label={t('avgDailySales')}
                            value={formatCurrency(aggregatesA.avgDailySales)}
                            currentValue={aggregatesA.avgDailySales}
                            previousValue={aggregatesPrev?.avgDailySales}
                        />
                         <KpiCard 
                            label={t('avgDailyUnits')}
                            value={formatNumber(Math.round(aggregatesA.avgDailyUnits))}
                            currentValue={aggregatesA.avgDailyUnits}
                            previousValue={aggregatesPrev?.avgDailyUnits}
                        />
                        <KpiCard 
                            label={t('avgOrderValue')}
                            value={formatCurrency(aggregatesA.avgOrderValue)}
                            currentValue={aggregatesA.avgOrderValue}
                            previousValue={aggregatesPrev?.avgOrderValue}
                        />
                        <KpiCard
                            label={t('promotionUsage')}
                            value={`${aggregatesA.promotionUsageRate}%`}
                            currentValue={aggregatesA.promotionUsageRate}
                            previousValue={aggregatesPrev?.promotionUsageRate}
                            hint={`${(aggregatesA.promotionUsageRate / 100 * aggregatesA.totalOrders).toLocaleString()} orders`}
                        />
                        <KpiCard
                            label={t('totalDiscounts')}
                            value={formatCurrency(aggregatesA.totalDiscount)}
                            currentValue={aggregatesA.totalDiscount}
                            previousValue={aggregatesPrev?.totalDiscount}
                        />
                    </>
                )}
            </div>
        </Card>
    );
};

export default SalesPerformanceKpiCard;
