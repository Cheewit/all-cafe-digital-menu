import React from 'react';
import Card from './Card';
import KpiCard, { KpiCompareCard } from './KpiCard';
import { useAggregates } from '../hooks/useAggregates';

type Aggregates = ReturnType<typeof useAggregates>;

interface BehavioralKpiCardProps {
    loading: boolean;
    aggregatesA: Aggregates;
    aggregatesB?: Aggregates;
    aggregatesPrev?: Aggregates;
}

const BehavioralKpiCard: React.FC<BehavioralKpiCardProps> = ({ loading, aggregatesA, aggregatesB, aggregatesPrev }) => {
    
    if (loading && aggregatesA.totalOrders === 0) {
        return null; // Don't show anything until main KPIs are loaded
    }
    
    const formatSeconds = (val: number) => `${val.toLocaleString()}s`;

    return (
        <Card>
            <div className="mb-4">
                <h3 className="text-base font-semibold leading-6 text-slate-100">User Behavior Insights</h3>
                <p className="mt-1 text-sm text-slate-400 font-mono">// Average user session timings</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aggregatesB ? (
                    <>
                        <KpiCompareCard label="Avg. Menu Time" valueA={aggregatesA.avgMenuDuration} valueB={aggregatesB.avgMenuDuration} formatValue={formatSeconds} />
                        <KpiCompareCard label="Avg. Customization Time" valueA={aggregatesA.avgCustomizationDuration} valueB={aggregatesB.avgCustomizationDuration} formatValue={formatSeconds} />
                        <KpiCompareCard label="Avg. Total Session Time" valueA={aggregatesA.avgTotalDuration} valueB={aggregatesB.avgTotalDuration} formatValue={formatSeconds} />
                    </>
                ) : (
                    <>
                        <KpiCard 
                            label="Avg. Menu Time" 
                            value={`${aggregatesA.avgMenuDuration}s`}
                            currentValue={aggregatesA.avgMenuDuration}
                            previousValue={aggregatesPrev?.avgMenuDuration}
                        />
                        <KpiCard 
                            label="Avg. Customization Time" 
                            value={`${aggregatesA.avgCustomizationDuration}s`}
                            currentValue={aggregatesA.avgCustomizationDuration}
                            previousValue={aggregatesPrev?.avgCustomizationDuration}
                        />
                        <KpiCard 
                            label="Avg. Total Session Time" 
                            value={`${aggregatesA.avgTotalDuration}s`}
                            currentValue={aggregatesA.avgTotalDuration}
                            previousValue={aggregatesPrev?.avgTotalDuration}
                        />
                    </>
                )}
            </div>
        </Card>
    );
};

export default BehavioralKpiCard;