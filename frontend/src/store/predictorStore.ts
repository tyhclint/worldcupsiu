import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GROUPS, getTeamById } from '@/src/lib/db';
import { AllGroupPicks, PredictorTab, Team } from '@/src/lib/types';

interface PredictorState {
  picks: AllGroupPicks;
  thirdPicks: string[]; // teamIds of selected third-place qualifiers
  activeTab: PredictorTab;

  // Actions
  setRank: (groupId: string, teamId: string, rank: 1 | 2 | 3) => void;
  clearRank: (groupId: string, rank: 1 | 2 | 3) => void;
  toggleThirdPick: (teamId: string) => void;
  setActiveTab: (tab: PredictorTab) => void;
  reset: () => void;

  // Derived (computed inline — call these as functions)
  isGroupComplete: (groupId: string) => boolean;
  allGroupsComplete: () => boolean;
  completedGroupCount: () => number;
  getQualifier: (groupId: string, rank: 1 | 2 | 3) => Team | null;
  getThirdPlaceTeams: () => (Team & { groupId: string })[];
  canAdvanceToThird: () => boolean;
  canAdvanceToBracket: () => boolean;
}

export const usePredictorStore = create<PredictorState>()(
  persist(
    (set, get) => ({
      picks: {},
      thirdPicks: [],
      activeTab: 'groups',

      setRank: (groupId, teamId, rank) => {
        set((state) => {
          const groupPicks = { ...(state.picks[groupId] ?? {}) };

          // Clear this team from any existing rank
          for (const r of [1, 2, 3] as const) {
            if (groupPicks[r] === teamId) delete groupPicks[r];
          }

          // Clear whoever was at this rank
          delete groupPicks[rank];

          // Assign
          groupPicks[rank] = teamId;

          return { picks: { ...state.picks, [groupId]: groupPicks } };
        });
      },

      clearRank: (groupId, rank) => {
        set((state) => {
          const groupPicks = { ...(state.picks[groupId] ?? {}) };
          delete groupPicks[rank];
          return { picks: { ...state.picks, [groupId]: groupPicks } };
        });
      },

      toggleThirdPick: (teamId) => {
        set((state) => {
          const existing = state.thirdPicks.includes(teamId);
          if (existing) {
            return { thirdPicks: state.thirdPicks.filter((id) => id !== teamId) };
          }
          if (state.thirdPicks.length >= 8) return state; // cap at 8
          return { thirdPicks: [...state.thirdPicks, teamId] };
        });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      reset: () => set({ picks: {}, thirdPicks: [], activeTab: 'groups' }),

      isGroupComplete: (groupId) => {
        const gp = get().picks[groupId] ?? {};
        return !!(gp[1] && gp[2] && gp[3]);
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
    }),
    {
      name: 'wc2026-predictor', // persists to localStorage
    }
  )
);