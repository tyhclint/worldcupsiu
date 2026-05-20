'use client';

import { usePredictorStore } from '@/src/store/predictorStore';
import { PredictorTab } from '@/src/lib/types';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/src/utils/merge';

const TABS: { id: PredictorTab; label: string }[] = [
  { id: 'groups', label: 'Groups' },
  { id: 'third', label: '3rd Place' },
  { id: 'bracket', label: 'Bracket' },
];

export default function PredictorTabs() {
  const { activeTab, setActiveTab, allGroupsComplete, canAdvanceToBracket } =
    usePredictorStore();

  const isTabEnabled = (tab: PredictorTab) => {
    if (tab === 'groups') return true;
    if (tab === 'third') return allGroupsComplete();
    if (tab === 'bracket') return canAdvanceToBracket();
    return false;
  };

  const isTabDone = (tab: PredictorTab) => {
    if (tab === 'groups') return allGroupsComplete();
    if (tab === 'third') return canAdvanceToBracket();
    return false;
  };

  return (
    <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
      {TABS.map(({ id, label }) => {
        const enabled = isTabEnabled(id);
        const done = isTabDone(id);
        const active = activeTab === id;

        return (
          <button
            key={id}
            disabled={!enabled}
            onClick={() => enabled && setActiveTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              active && 'bg-gray-100 text-gray-900',
              !active && enabled && 'text-gray-500 hover:text-gray-700',
              !enabled && 'cursor-not-allowed opacity-40 text-gray-400'
            )}
          >
            {done && (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}