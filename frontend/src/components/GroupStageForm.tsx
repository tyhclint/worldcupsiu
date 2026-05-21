'use client';

import { GROUPS } from '@/src/lib/db';
import { usePredictorStore } from '@/src/store/predictorStore';
import { cn } from '@/src/utils/merge';

// Red / Orange / Teal — rank 1 / 2 / 3
const RANK_STYLES = {
  1: {
    active: 'bg-red-500 border-red-500 text-white',
    hover: 'hover:border-red-400 hover:text-red-500',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    bar: 'bg-red-500',
    stripe: 'bg-red-500',
  },
  2: {
    active: 'bg-orange-400 border-orange-400 text-white',
    hover: 'hover:border-orange-300 hover:text-orange-400',
    badge: 'bg-orange-50 text-orange-700 border border-orange-200',
    bar: 'bg-orange-400',
    stripe: 'bg-orange-400',
  },
  3: {
    active: 'bg-teal-500 border-teal-500 text-white',
    hover: 'hover:border-teal-400 hover:text-teal-500',
    badge: 'bg-teal-50 text-teal-700 border border-teal-200',
    bar: 'bg-teal-500',
    stripe: 'bg-teal-500',
  },
} as const;

export default function GroupStageForm() {
  const { picks, setRank, isGroupComplete, allGroupsComplete, completedGroupCount, setActiveTab } =
    usePredictorStore();

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Pick the top 2 teams to qualify from each group. The 3rd-place team is used in the next step.
      </p>

      {/* 4-column grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-6 px-6 pb-2">
        <div className="grid grid-cols-4 gap-3 min-w-[900px] md:min-w-0">
          {GROUPS.map((group) => {
            const gp = picks[group.id] ?? {};
            const complete = isGroupComplete(group.id);
            const rankedCount = ([1, 2, 3] as const).filter((r) => gp[r]).length;
            const progressPct = Math.round((rankedCount / 3) * 100);

            return (
              <div
                key={group.id}
                className={cn(
                  'rounded-lg border bg-white overflow-hidden transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  complete ? 'border-teal-200' : 'border-gray-200'
                )}
              >
                {/* Group header */}
                <div className={cn(
                  'px-3 py-2 border-b',
                  complete ? 'border-teal-100 bg-teal-50/50' : 'border-gray-100 bg-gray-50'
                )}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {group.name}
                  </span>

                  {/* Qualifier badges */}
                  <div className="flex flex-wrap gap-1 mt-1 min-h-[18px]">
                    {([1, 2, 3] as const).map((rank) => {
                      const teamId = gp[rank];
                      const team = group.teams.find((t) => t.id === teamId);
                      if (!team) return null;
                      return (
                        <span
                          key={rank}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none',
                            RANK_STYLES[rank].badge
                          )}
                        >
                          {team.flag} {team.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Team rows */}
                {group.teams.map((team) => {
                  const assignedRank = ([1, 2, 3] as const).find((r) => gp[r] === team.id);
                  const eliminated = complete && !assignedRank;
                  const stripeColor = assignedRank ? RANK_STYLES[assignedRank].stripe : null;

                  return (
                    <div
                      key={team.id}
                      className={cn(
                        'flex items-center border-b border-gray-50 last:border-b-0 transition-all duration-300',
                        eliminated && 'opacity-30'
                      )}
                    >
                      {/* Left colour stripe */}
                      <div
                        className={cn(
                          'w-1 self-stretch flex-shrink-0 transition-all duration-300',
                          stripeColor ?? 'bg-transparent'
                        )}
                      />

                      <div className="flex items-center justify-between flex-1 px-2 py-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={cn(
                              'text-base leading-none flex-shrink-0 transition-all duration-300',
                              eliminated && 'grayscale'
                            )}
                          >
                            {team.flag}
                          </span>
                          <span
                            className={cn(
                              'text-xs truncate transition-all duration-300',
                              eliminated ? 'text-gray-400 line-through' : 'text-gray-700'
                            )}
                          >
                            {team.name}
                          </span>
                        </div>

                        {/* Rank buttons */}
                        <div className="flex gap-0.5 flex-shrink-0 ml-1">
                          {([1, 2, 3] as const).map((rank) => {
                            const isActive = assignedRank === rank;
                            const styles = RANK_STYLES[rank];
                            return (
                              <button
                                key={rank}
                                onClick={() => setRank(group.id, team.id, rank)}
                                className={cn(
                                  'h-6 w-6 rounded-md border text-[11px] font-bold transition-all duration-150',
                                  isActive
                                    ? styles.active
                                    : cn('border-gray-200 text-gray-400 bg-transparent', styles.hover)
                                )}
                              >
                                {rank}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Teal progress bar */}
                <div className="h-1 bg-gray-100">
                  <div
                    className="h-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress CTA */}
      <div>
        {allGroupsComplete() ? (
          <button
            onClick={() => setActiveTab('third')}
            className="w-full rounded-lg bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            All groups done! Pick 3rd place qualifiers →
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            {completedGroupCount()} / {GROUPS.length} groups complete
          </button>
        )}
      </div>
    </div>
  );
}