import React, { useMemo } from 'react';
import Card from './Card';
import { useAggregates } from '../hooks/useAggregates';
import { ActiveFilter } from '../App';

type Aggregates = ReturnType<typeof useAggregates>;

interface TopProductsPerformanceTableProps {
    aggregatesA: Aggregates;
    aggregatesB?: Aggregates;
    aggregatesPrev?: Aggregates;
    activeFilter: ActiveFilter;
    onFilterChange: (filter: ActiveFilter | null) => void;
}

const TrendIndicator: React.FC<{ change: number | null, type: 'rank' | 'sales' }> = ({ change, type }) => {
    if (change === null) {
        return <span className="text-blue-400 font-mono text-xs">NEW</span>;
    }
    if (change === 0) {
        return <span className="font-mono text-xs text-slate-500">—</span>;
    }

    const isPositive = (type === 'rank' && change > 0) || (type === 'sales' && change > 0);
    const isNegative = (type === 'rank' && change < 0) || (type === 'sales' && change < 0);
    
    const color = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-500';
    const symbol = isPositive ? '▲' : '▼';

    if (type === 'rank') {
        return <span className={`${color} font-mono text-sm`}>{symbol} {Math.abs(change)}</span>;
    }

    return <span className={`${color} font-mono text-xs`}>{symbol} {Math.abs(change).toFixed(1)}%</span>;
}


const TopProductsPerformanceTable: React.FC<TopProductsPerformanceTableProps> = ({ aggregatesA, aggregatesB, aggregatesPrev, activeFilter, onFilterChange }) => {
    const comparisonData = aggregatesB || aggregatesPrev;

    const rankMapB = useMemo(() => {
        if (!comparisonData) return new Map();
        return new Map(comparisonData.topProducts.map((p, i) => [p.name, { rank: i + 1, sales: p.sales }]));
    }, [comparisonData]);

    const handleRowClick = (productName: string) => {
        if (activeFilter && activeFilter.type === 'product' && activeFilter.value === productName) {
            onFilterChange(null);
        } else {
            onFilterChange({ type: 'product', value: productName });
        }
    };

    const isFilterActiveForThisChart = activeFilter?.type === 'product';
    
    return (
        <Card span="3">
            <div className="relative">
                {isFilterActiveForThisChart && (
                    <button
                        onClick={() => onFilterChange(null)}
                        className="absolute top-0 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                        aria-label="Clear product filter"
                    >
                        &times; Clear Filter
                    </button>
                )}
                <div className="mb-4">
                    <h3 className="text-base font-semibold leading-6 text-slate-100">Top 10 Products Performance</h3>
                    <p className="mt-1 text-sm text-slate-400 font-mono">// Detailed breakdown of best-selling items</p>
                </div>
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-slate-800">
                                <thead className="bg-slate-900/80">
                                    <tr>
                                        <th scope="col" className="w-16 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-100 sm:pl-6">Rank</th>
                                        {comparisonData && <th scope="col" className="w-16 px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Trend</th>}
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Product</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Units Sold</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Total Sales</th>
                                        {comparisonData && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-slate-100">Sales Trend</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                                    {aggregatesA.topProducts.map((product, index) => {
                                        const currentRank = index + 1;
                                        const prevData = rankMapB.get(product.name);
                                        const prevRank = prevData?.rank;
                                        const prevSales = prevData?.sales;

                                        const rankChange = prevRank ? prevRank - currentRank : null;
                                        let salesChange: number | null = null;
                                        if (prevSales !== undefined) {
                                            salesChange = prevSales > 0 ? ((product.sales - prevSales) / prevSales) * 100 : product.sales > 0 ? Infinity : 0;
                                        }
                                        const isFiltered = activeFilter?.type === 'product' && activeFilter?.value === product.name;

                                        return (
                                            <tr 
                                                key={product.name} 
                                                onClick={() => handleRowClick(product.name)}
                                                className={`transition-colors duration-200 cursor-pointer ${isFiltered ? 'bg-cyan-900/50' : 'hover:bg-slate-800/60'}`}
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-slate-300 sm:pl-6">{`#${currentRank}`}</td>
                                                {comparisonData && <td className="whitespace-nowrap px-3 py-4 text-sm"><TrendIndicator change={rankChange} type="rank" /></td>}
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-200">{product.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-cyan-300">{product.count.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-cyan-300">{`฿${product.sales.toLocaleString()}`}</td>
                                                {comparisonData && <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6"><TrendIndicator change={salesChange} type="sales" /></td>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {aggregatesA.topProducts.length === 0 && (
                                <div className="text-center py-12 font-mono text-slate-500">
                                    -- No product data available for this period --
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TopProductsPerformanceTable;