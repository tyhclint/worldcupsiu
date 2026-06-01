'use client';

import { usePredictorStore } from '@/src/store/predictorStore';
import { PredictorTab } from '@/src/lib/types';
import { cn } from '@/src/utils/merge';

const TABS: { id: PredictorTab; label: string }[] = [
  { id: 'groups', label: 'Groups' },
  { id: 'third', label: 'Wildcards' },
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
    <div className="flex w-full border-b border-gray-200">
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
              'flex-1 flex justify-center items-center px-1 sm:px-4 py-3 text-[11px] sm:text-sm font-bold sm:font-medium border-b-2 -mb-px transition-all duration-150 whitespace-nowrap',
              active
                ? 'text-gray-900 border-red-500'
                : 'border-transparent',
              enabled && !active && 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
              !enabled && 'text-gray-300 cursor-not-allowed'
            )}
          >
            {done && !active && <span className="mr-1 sm:mr-1.5 text-teal-500 text-sm sm:text-base leading-none">✓</span>}
            <span className="uppercase tracking-wider sm:tracking-normal sm:normal-case">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
