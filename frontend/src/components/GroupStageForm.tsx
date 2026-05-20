'use client';

import { GROUPS } from '@/src/lib/db';
import { usePredictorStore } from '@/src/store/predictorStore';
import { cn } from '@/src/utils/merge';

const RANK_STYLES = {
  1: {
    active: 'bg-emerald-500 border-emerald-500 text-white',
    hover: 'hover:border-emerald-400 hover:text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  2: {
    active: 'bg-blue-500 border-blue-500 text-white',
    hover: 'hover:border-blue-400 hover:text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  3: {
    active: 'bg-amber-500 border-amber-500 text-white',
    hover: 'hover:border-amber-400 hover:text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
} as const;

export default function GroupStageForm() {
  const { picks, setRank, isGroupComplete, allGroupsComplete, completedGroupCount, setActiveTab } =
    usePredictorStore();

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Pick the top 2 teams to qualify from each group. The 3rd-place team is used in the next
        step.
      </p>

      {GROUPS.map((group) => {
        const gp = picks[group.id] ?? {};
        const complete = isGroupComplete(group.id);

        return (
          <div
            key={group.id}
            className={cn(
              'rounded-xl border bg-white overflow-hidden transition-colors',
              complete ? 'border-emerald-200' : 'border-gray-200'
            )}
          >
            {/* Group header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.name}
              </span>
              <div className="flex gap-1.5">
                {([1, 2, 3] as const).map((rank) => {
                  const teamId = gp[rank];
                  const team = group.teams.find((t) => t.id === teamId);
                  if (!team) return null;
                  return (
                    <span
                      key={rank}
                      className={cn('text-xs px-2 py-0.5 rounded-full font-medium', RANK_STYLES[rank].badge)}
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

              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl leading-none">{team.flag}</span>
                    <span className="text-sm text-gray-800">{team.name}</span>
                  </div>

                  <div className="flex gap-1.5">
                    {([1, 2, 3] as const).map((rank) => {
                      const isActive = assignedRank === rank;
                      const styles = RANK_STYLES[rank];
                      return (
                        <button
                          key={rank}
                          onClick={() => setRank(group.id, team.id, rank)}
                          className={cn(
                            'h-8 w-8 rounded-full border text-sm font-medium transition-all',
                            isActive
                              ? styles.active
                              : cn('border-gray-200 text-gray-400', styles.hover)
                          )}
                        >
                          {rank}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Progress CTA */}
      <div className="pt-2">
        {allGroupsComplete() ? (
          <button
            onClick={() => setActiveTab('third')}
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            All groups done! Pick 3rd place qualifiers →
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-xl bg-gray-100 py-3.5 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            {completedGroupCount()} / {GROUPS.length} groups complete
          </button>
        )}
      </div>
    </div>
  );
}