'use client';

import { usePredictorStore } from '@/src/store/predictorStore';
import { cn } from '@/src/utils/merge';
import FlagIcon from '@/src/components/FlagIcon';

export default function ThirdPlaceForm() {
  const {
    thirdPicks,
    toggleThirdPick,
    getThirdPlaceTeams,
    canAdvanceToBracket,
    setActiveTab,
  } = usePredictorStore();

  const thirdPlaceTeams = getThirdPlaceTeams();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Select the eight third-place teams that qualify for the Round of 32.
        </p>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
          {thirdPicks.length} / 8 selected
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {thirdPlaceTeams.map((team) => {
          const selectedIndex = thirdPicks.indexOf(team.id);
          const selected = selectedIndex >= 0;

          return (
            <button
              key={team.id}
              onClick={() => toggleThirdPick(team.id)}
              className={cn(
                'flex min-h-16 items-center justify-between rounded-lg border bg-white px-3 py-2 text-left transition-all',
                selected
                  ? 'border-teal-400 bg-teal-50 text-gray-900 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm',
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <FlagIcon teamId={team.id} label={team.name} className="text-lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{team.name}</span>
                  <span className="block text-xs text-gray-400">Group {team.groupId} third place</span>
                </span>
              </span>
              <span
                className={cn(
                  'ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  selected ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400',
                )}
              >
                {selected ? selectedIndex + 1 : ''}
              </span>
            </button>
          );
        })}
      </div>

      <button
        disabled={!canAdvanceToBracket()}
        onClick={() => setActiveTab('bracket')}
        className={cn(
          'w-full rounded-lg py-3 text-sm font-semibold transition-colors',
          canAdvanceToBracket()
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'cursor-not-allowed bg-gray-100 text-gray-400',
        )}
      >
        Build knockout bracket
      </button>
    </div>
  );
}
