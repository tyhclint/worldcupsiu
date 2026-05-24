import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildPredictionPayload, isBracketComplete } from '@/src/lib/bracket';
import { DOWNSTREAM_MATCH_IDS } from '@/src/lib/bracketConfig';
import { GROUPS, getTeamById } from '@/src/lib/db';
import {
  AllGroupPicks,
  BracketDataPayload,
  CreatePredictionRequest,
  KnockoutMatchId,
  KnockoutPicks,
  PredictorTab,
  Team,
} from '@/src/lib/types';

interface PredictorState {
  picks: AllGroupPicks;
  thirdPicks: string[];
  knockoutPicks: KnockoutPicks;
  activeTab: PredictorTab;
  hasSavedBracket: boolean;

  // Actions
  setRank: (groupId: string, teamId: string, rank: 1 | 2 | 3) => void;
  clearRank: (groupId: string, rank: 1 | 2 | 3) => void;
  toggleThirdPick: (teamId: string) => void;
  setKnockoutWinner: (matchId: KnockoutMatchId, teamId: string) => void;
  setActiveTab: (tab: PredictorTab) => void;
  loadBracketData: (bracketData: BracketDataPayload | null) => void;
  markBracketSaved: () => void;
  reset: () => void;

  // Derived values - call these as functions.
  isGroupComplete: (groupId: string) => boolean;
  allGroupsComplete: () => boolean;
  completedGroupCount: () => number;
  getQualifier: (groupId: string, rank: 1 | 2 | 3) => Team | null;
  getThirdPlaceTeams: () => (Team & { groupId: string })[];
  canAdvanceToThird: () => boolean;
  canAdvanceToBracket: () => boolean;
  isBracketComplete: () => boolean;
  buildPredictionPayload: () => CreatePredictionRequest | null;
}

export const usePredictorStore = create<PredictorState>()(
  persist(
    (set, get) => ({
      picks: {},
      thirdPicks: [],
      knockoutPicks: {},
      activeTab: 'groups',
      hasSavedBracket: false,

      setRank: (groupId, teamId, rank) => {
        set((state) => {
          const groupPicks = { ...(state.picks[groupId] ?? {}) };

          for (const r of [1, 2, 3] as const) {
            if (groupPicks[r] === teamId) delete groupPicks[r];
          }

          delete groupPicks[rank];
          groupPicks[rank] = teamId;

          return {
            picks: { ...state.picks, [groupId]: groupPicks },
            thirdPicks: [],
            knockoutPicks: {},
          };
        });
      },

      clearRank: (groupId, rank) => {
        set((state) => {
          const groupPicks = { ...(state.picks[groupId] ?? {}) };
          delete groupPicks[rank];

          return {
            picks: { ...state.picks, [groupId]: groupPicks },
            thirdPicks: [],
            knockoutPicks: {},
          };
        });
      },

      toggleThirdPick: (teamId) => {
        set((state) => {
          const existing = state.thirdPicks.includes(teamId);
          if (existing) {
            return {
              thirdPicks: state.thirdPicks.filter((id) => id !== teamId),
              knockoutPicks: {},
            };
          }
          if (state.thirdPicks.length >= 8) return state;

          return {
            thirdPicks: [...state.thirdPicks, teamId],
            knockoutPicks: {},
          };
        });
      },

      setKnockoutWinner: (matchId, teamId) => {
        set((state) => {
          const currentWinner = state.knockoutPicks[matchId];
          if (currentWinner === teamId) return state;

          const nextPicks = { ...state.knockoutPicks, [matchId]: teamId };
          for (const downstreamMatchId of DOWNSTREAM_MATCH_IDS[matchId]) {
            delete nextPicks[downstreamMatchId];
          }

          return { knockoutPicks: nextPicks };
        });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      loadBracketData: (bracketData) => {
        if (!bracketData) {
          set({
            picks: {},
            thirdPicks: [],
            knockoutPicks: {},
            activeTab: 'groups',
            hasSavedBracket: false,
          });
          return;
        }

        const picks = Object.entries(bracketData.group_stage).reduce<AllGroupPicks>(
          (acc, [groupKey, groupPicks]) => {
            const groupId = groupKey.replace('Group_', '');
            acc[groupId] = {
              1: groupPicks.first,
              2: groupPicks.second,
              3: groupPicks.third,
            };
            return acc;
          },
          {},
        );

        const knockoutPicks = { ...bracketData.knockouts };
        const activeTab = Object.keys(knockoutPicks).length > 0
          ? 'bracket'
          : bracketData.wildcards.length > 0
            ? 'third'
            : 'groups';

        set({
          picks,
          thirdPicks: [...bracketData.wildcards],
          knockoutPicks,
          activeTab,
          hasSavedBracket: true,
        });
      },

      markBracketSaved: () => set({ hasSavedBracket: true }),

      reset: () => set({ picks: {}, thirdPicks: [], knockoutPicks: {}, activeTab: 'groups' }),

      isGroupComplete: (groupId) => {
        const gp = get().picks[groupId] ?? {};
        return Boolean(gp[1] && gp[2] && gp[3]);
      },

      allGroupsComplete: () => {
        return GROUPS.every((g) => get().isGroupComplete(g.id));
      },

      completedGroupCount: () => {
        return GROUPS.filter((g) => get().isGroupComplete(g.id)).length;
      },

      getQualifier: (groupId, rank) => {
        const teamId = get().picks[groupId]?.[rank];
        return teamId ? (getTeamById(teamId) ?? null) : null;
      },

      getThirdPlaceTeams: () => {
        return GROUPS.map((g) => {
          const teamId = get().picks[g.id]?.[3];
          if (!teamId) return null;
          const team = getTeamById(teamId);
          if (!team) return null;
          return { ...team, groupId: g.id };
        }).filter((t): t is Team & { groupId: string } => t !== null);
      },

      canAdvanceToThird: () => get().allGroupsComplete(),
      canAdvanceToBracket: () => get().thirdPicks.length === 8,
      isBracketComplete: () => isBracketComplete(get().knockoutPicks),
      buildPredictionPayload: () => buildPredictionPayload(
        get().picks,
        get().thirdPicks,
        get().knockoutPicks,
      ),
    }),
    {
      name: 'wc2026-predictor',
      skipHydration: true,
    },
  ),
);
