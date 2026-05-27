'use client';

import { useEffect, useMemo, useState } from 'react';
import BracketForm from '@/src/components/BracketForm';
import GroupStageForm from '@/src/components/GroupStageForm';
import PredictorTabs from '@/src/components/PredictorTabs';
import ThirdPlaceForm from '@/src/components/ThirdPlaceForm';
import { retrieveBracketPayload, scoreGroupStagePayload } from '@/src/app/api/api';
import { toGroupKey } from '@/src/lib/bracket';
import { GROUPS } from '@/src/lib/db';
import type { BracketDataPayload, GroupId } from '@/src/lib/types';
import { usePredictorStore } from '@/src/store/predictorStore';

export default function PredictorPage() {
  const { activeTab, picks, reset, loadBracketData, allGroupsComplete } = usePredictorStore();
  const [groupScoreResult, setGroupScoreResult] = useState<{
    key: string;
    score: number | null;
    status: 'idle' | 'error';
  } | null>(null);

  const groupScorePayload = useMemo(() => {
    if (activeTab !== 'groups') return null;
    if (!allGroupsComplete()) return null;

    const groupStage = GROUPS.reduce((acc, group) => {
      const groupPicks = picks[group.id];

      acc[toGroupKey(group.id as GroupId)] = {
        first: groupPicks[1],
        second: groupPicks[2],
        third: groupPicks[3],
      };

      return acc;
    }, {} as BracketDataPayload['group_stage']);

    return {
      group_stage: groupStage,
      key: JSON.stringify(groupStage),
    };
  }, [activeTab, allGroupsComplete, picks]);

  useEffect(() => {
    const loadUserBracket = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        loadBracketData(null);
        return;
      }

      try {
        const data = await retrieveBracketPayload();
        loadBracketData(data.bracket_data);
      } catch (error) {
        console.error('Failed to load saved bracket', error);
        loadBracketData(null);
      }
    };

    void loadUserBracket();
    window.addEventListener('auth-change', loadUserBracket);

    return () => window.removeEventListener('auth-change', loadUserBracket);
  }, [loadBracketData]);

  useEffect(() => {
    if (!groupScorePayload) return;

    let ignore = false;
    const { key, ...payload } = groupScorePayload;

    scoreGroupStagePayload(payload)
      .then((data) => {
        if (ignore) return;
        setGroupScoreResult({ key, score: data.score, status: 'idle' });
      })
      .catch((error) => {
        if (ignore) return;
        console.error('Failed to score group stage', error);
        setGroupScoreResult({ key, score: null, status: 'error' });
      });

    return () => {
      ignore = true;
    };
  }, [groupScorePayload]);

  const scoreReady = groupScorePayload && groupScoreResult?.key === groupScorePayload.key;
  const groupScore = scoreReady ? groupScoreResult.score : null;
  const scoreStatus = groupScorePayload
    ? scoreReady ? groupScoreResult.status : 'loading'
    : 'idle';

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
      
      {/* Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-4">        
        <div className="mt-1">
          <button
            onClick={reset}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Reset all
          </button>
        </div>

        {activeTab === 'groups' && (
          <div className="min-w-40 rounded-lg border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Group stage score</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {scoreStatus === 'loading' ? '...' : groupScore ?? '-'}
            </p>
            <p className="text-xs text-gray-400">
              {scoreStatus === 'error'
                ? 'Unable to score'
                : groupScore === null
                  ? 'Complete all groups'
                  : 'Lower is better'}
            </p>
          </div>
        )}
      </div>

      <PredictorTabs />

      {activeTab === 'groups' && <GroupStageForm />}
      {activeTab === 'third' && <ThirdPlaceForm />}
      {activeTab === 'bracket' && <BracketForm />}
    </div>
  );
}
