'use client';

import { usePredictorStore } from '@/src/store/predictorStore';
import { PredictorTab } from '@/src/lib/types';
import { cn } from '@/src/utils/merge';

const TABS: { id: PredictorTab; label: string }[] = [
  { id: 'groups', label: 'Groups' },
  { id: 'third', label: '3rd Place' },
  { id: 'bracket', label: 'Bracket' },
];

export default function PredictorTabs() {
  const { activeTab, setActiveTab, allGroupsComplete, canAdvanceToBracket } = usePredictorStore();

  const isEnabled = (tab: PredictorTab) => {
    if (tab === 'groups') return true;
    if (tab === 'third') return allGroupsComplete();
    if (tab === 'bracket') return canAdvanceToBracket();
    return false;
  };

  const isDone = (tab: PredictorTab) => {
    if (tab === 'groups') return allGroupsComplete();
    if (tab === 'third') return canAdvanceToBracket();
    return false;
  };

  return (
    <div className="flex border-b border-gray-200">
      {TABS.map(({ id, label }) => {
        const enabled = isEnabled(id);
        const done = isDone(id);
        const active = activeTab === id;

        return (
          <button
            key={id}
            disabled={!enabled}
            onClick={() => enabled && setActiveTab(id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-150',
              active
                ? 'text-gray-900 border-red-500'
                : 'border-transparent',
              enabled && !active && 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
              !enabled && 'text-gray-300 cursor-not-allowed'
            )}
          >
            {done && !active && <span className="mr-1.5 text-teal-500">✓</span>}
            {label}
          </button>
        );
      })}
    </div>
  );
}