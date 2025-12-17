import React from 'react';
import Card from './Card';
import { useAggregates } from '../hooks/useAggregates';
import ActionDistributionChart from './ActionDistributionChart';
import { ActiveFilter } from '../App';

type Aggregates = ReturnType<typeof useAggregates>;

interface FeedbackCardProps {
    aggregatesA: Aggregates;
    aggregatesB?: Aggregates;
    activeFilter: ActiveFilter;
    onFilterChange: (filter: ActiveFilter | null) => void;
}

const FeedbackList: React.FC<{feedback: string[], title: string}> = ({ feedback, title }) => (
    <div>
        <h3 className="text-base font-semibold leading-6 text-slate-100">{title}</h3>
        <p className="mt-1 text-sm text-slate-400 font-mono">// Direct feedback from users</p>
        {feedback.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm font-mono text-slate-300">
                {feedback.map((fb, i) => (
                    <li key={i} className="relative pl-5 before:content-['//'] before:absolute before:left-0 before:text-cyan-400/50">
                        {fb}
                    </li>
                ))}
            </ul>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono mt-4">
                -- No improvement suggestions in this period --
            </div>
        )}
    </div>
)

const FeedbackCard: React.FC<FeedbackCardProps> = ({ aggregatesA, aggregatesB, activeFilter, onFilterChange }) => {
    
    const handlePieClick = (payload: any) => {
        const clickedAction = payload.name;
        if (activeFilter && activeFilter.type === 'action' && activeFilter.value === clickedAction) {
            onFilterChange(null);
        } else {
            onFilterChange({ type: 'action', value: clickedAction });
        }
    };

    const isActionFilterActive = activeFilter?.type === 'action';
    
    return (
        <Card span="3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                     <h3 className="text-base font-semibold leading-6 text-slate-100">User Actions</h3>
                     <p className="mt-1 text-sm text-slate-400 font-mono">// Distribution of user interactions</p>
                    {isActionFilterActive && (
                        <button
                            onClick={() => onFilterChange(null)}
                            className="absolute -top-1 right-0 z-10 text-xs font-mono text-cyan-400 hover:text-cyan-200 border border-cyan-400/50 bg-slate-800/70 backdrop-blur-sm rounded-full px-2 py-0.5 transition-colors whitespace-nowrap"
                            aria-label="Clear action filter"
                        >
                            &times; Clear Filter
                        </button>
                    )}
                     {aggregatesB ? (
                        <div className="flex flex-col md:flex-row gap-4 items-center h-[250px] mt-4">
                            <ActionDistributionChart data={aggregatesA.byAction} title="Period A" activeFilter={activeFilter} onPieClick={handlePieClick} />
                            <ActionDistributionChart data={aggregatesB.byAction} title="Period B" />
                        </div>
                     ) : (
                        <div className="h-[250px] mt-4">
                            <ActionDistributionChart data={aggregatesA.byAction} activeFilter={activeFilter} onPieClick={handlePieClick} />
                        </div>
                     )}
                </div>
                <div>
                    {aggregatesB ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                           <FeedbackList feedback={aggregatesA.latestFeedback} title="Recent Suggestions (A)" />
                           <FeedbackList feedback={aggregatesB.latestFeedback} title="Recent Suggestions (B)" />
                        </div>
                    ) : (
                        <FeedbackList feedback={aggregatesA.latestFeedback} title="Recent Suggestions" />
                    )}
                </div>
            </div>
        </Card>
    );
};

export default FeedbackCard;