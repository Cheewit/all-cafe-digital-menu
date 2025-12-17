import React from 'react';
import Card from './Card';
import { useAggregates } from '../hooks/useAggregates';
import { ActiveFilter } from '../App';

type Aggregates = ReturnType<typeof useAggregates>;

interface PromotionPerformanceTableProps {
    aggregatesA: Aggregates;
    aggregatesB?: Aggregates;
    activeFilter: ActiveFilter;
    onFilterChange: (filter: ActiveFilter | null) => void;
}

const PromotionPerformanceTable: React.FC<PromotionPerformanceTableProps> = ({ aggregatesA, activeFilter, onFilterChange }) => {

    const handleRowClick = (promoName: string) => {
        if (activeFilter?.type === 'promotion' && activeFilter.value === promoName) {
            onFilterChange(null);
        } else {
            onFilterChange({ type: 'promotion', value: promoName });
        }
    };

    const isFilterActiveForThisChart = activeFilter?.type === 'promotion';
    
    return (
        <Card span="3">
            <div className="relative">
                {isFilterActiveForThisChart && (
                    <button
                        onClick={() => onFilterChange(null)}
                        className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                        aria-label="Clear promotion filter"
                    >
                        &times; Clear Filter
                    </button>
                )}
                <div className="mb-4">
                    <h3 className="text-base font-semibold leading-6 text-slate-100">Promotion Performance</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">// Effectiveness of marketing promotions</p>
                </div>
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-slate-800">
                                <thead className="bg-slate-900/80">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-100 sm:pl-6">Promotion Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Usage Count</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Sales Generated</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Total Discount</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Avg. Discount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                                    {aggregatesA.byPromotion.map((promo) => {
                                        const isFiltered = activeFilter?.type === 'promotion' && activeFilter?.value === promo.name;
                                        const avgDiscount = promo.count > 0 ? promo.totalDiscount / promo.count : 0;

                                        return (
                                            <tr 
                                                key={promo.name} 
                                                onClick={() => handleRowClick(promo.name)}
                                                className={`transition-colors duration-200 cursor-pointer ${isFiltered ? 'bg-cyan-900/50' : 'hover:bg-slate-800/60'}`}
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-200 sm:pl-6">{promo.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-cyan-300">{promo.count.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-cyan-300">{`฿${promo.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-yellow-400">{`฿${promo.totalDiscount.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-yellow-400">{`฿${avgDiscount.toLocaleString(undefined, {minimumFractionDigits: 2})}`}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {aggregatesA.byPromotion.length === 0 && (
                                <div className="text-center py-12 font-mono text-slate-500">
                                    -- No promotion data available for this period --
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PromotionPerformanceTable;