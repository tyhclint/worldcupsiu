import { THIRD_PLACE_MATRIX } from './thirdPlaceMatrix';
import {
  KNOCKOUT_MATCHES,
  REQUIRED_KNOCKOUT_MATCH_IDS,
  ROUND_ORDER,
  type MatchConfig,
  type RoundId,
  type TeamSource,
  type ThirdPlaceAllocation,
} from './bracketConfig';
import { getTeamById } from './db';
import type {
  AllGroupPicks,
  BracketDataPayload,
  CreatePredictionRequest,
  GroupId,
  GroupKey,
  KnockoutMatchId,
  KnockoutPicks,
  Team,
} from './types';

export type ResolvedTeam = Team & {
  groupId?: GroupId;
  seedLabel?: string;
};

export type ResolvedMatch = MatchConfig & {
  teamAResolved: ResolvedTeam | null;
  teamBResolved: ResolvedTeam | null;
  winner: ResolvedTeam | null;
  ready: boolean;
};

export function toGroupKey(groupId: GroupId): GroupKey {
  return `Group_${groupId}` as GroupKey;
}

function teamFromId(teamId: string | undefined, seedLabel?: string, groupId?: GroupId): ResolvedTeam | null {
  if (!teamId) return null;

  const team = getTeamById(teamId);
  if (!team) return null;

  return {
    ...team,
    groupId,
    seedLabel,
  };
}

export function getThirdPlaceQualifierGroups(picks: AllGroupPicks, thirdPicks: string[]): GroupId[] {
  return Object.entries(picks)
    .filter(([, groupPicks]) => {
      const thirdPlaceTeamId = groupPicks[3];
      return thirdPlaceTeamId && thirdPicks.includes(thirdPlaceTeamId);
    })
    .map(([groupId]) => groupId as GroupId)
    .sort();
}

export function getThirdPlaceAllocation(
  picks: AllGroupPicks,
  thirdPicks: string[],
): ThirdPlaceAllocation | null {
  const key = getThirdPlaceQualifierGroups(picks, thirdPicks).join('');
  return THIRD_PLACE_MATRIX[key] ?? null;
}

export function resolveTeamSource(
  source: TeamSource,
  picks: AllGroupPicks,
  thirdPicks: string[],
  knockoutPicks: KnockoutPicks,
): ResolvedTeam | null {
  if (source.type === 'group_rank') {
    return teamFromId(
      picks[source.group]?.[source.rank],
      `${source.rank}${source.group}`,
      source.group,
    );
  }

  if (source.type === 'third_place') {
    const allocation = getThirdPlaceAllocation(picks, thirdPicks);
    const groupId = allocation?.[source.matchId];
    return groupId
      ? teamFromId(picks[groupId]?.[3], `3${groupId}`, groupId)
      : null;
  }

  return teamFromId(knockoutPicks[source.matchId], `W${source.matchId}`);
}

export function resolveMatch(
  match: MatchConfig,
  picks: AllGroupPicks,
  thirdPicks: string[],
  knockoutPicks: KnockoutPicks,
): ResolvedMatch {
  const teamAResolved = resolveTeamSource(match.teamA, picks, thirdPicks, knockoutPicks);
  const teamBResolved = resolveTeamSource(match.teamB, picks, thirdPicks, knockoutPicks);
  const winner = teamFromId(knockoutPicks[match.id], `W${match.id}`);

  return {
    ...match,
    teamAResolved,
    teamBResolved,
    winner,
    ready: Boolean(teamAResolved && teamBResolved),
  };
}

export function resolveMatchesByRound(
  picks: AllGroupPicks,
  thirdPicks: string[],
  knockoutPicks: KnockoutPicks,
): Record<RoundId, ResolvedMatch[]> {
  return ROUND_ORDER.reduce((acc, round) => {
    acc[round] = KNOCKOUT_MATCHES
      .filter((match) => match.round === round)
      .map((match) => resolveMatch(match, picks, thirdPicks, knockoutPicks));
    return acc;
  }, {} as Record<RoundId, ResolvedMatch[]>);
}

export function isBracketComplete(knockoutPicks: KnockoutPicks): boolean {
  return REQUIRED_KNOCKOUT_MATCH_IDS.every((matchId) => Boolean(knockoutPicks[matchId]));
}

export function buildPredictionPayload(
  picks: AllGroupPicks,
  thirdPicks: string[],
  knockoutPicks: KnockoutPicks,
): CreatePredictionRequest | null {
  if (!isBracketComplete(knockoutPicks)) return null;

  const groupStage = (Object.keys(picks) as GroupId[]).reduce((acc, groupId) => {
    const groupPicks = picks[groupId];
    if (!groupPicks?.[1] || !groupPicks?.[2] || !groupPicks?.[3]) return acc;

    acc[toGroupKey(groupId)] = {
      first: groupPicks[1],
      second: groupPicks[2],
      third: groupPicks[3],
    };

    return acc;
  }, {} as BracketDataPayload['group_stage']);

  if (Object.keys(groupStage).length !== 12 || thirdPicks.length !== 8) return null;

  const knockouts = REQUIRED_KNOCKOUT_MATCH_IDS.reduce((acc, matchId) => {
    const winner = knockoutPicks[matchId];
    if (winner) acc[matchId] = winner;
    return acc;
  }, {} as Record<KnockoutMatchId, string>);

  return {
    bracket_data: {
      group_stage: groupStage,
      wildcards: thirdPicks,
      knockouts,
    },
  };
}

export function transformDbBracketToState(bracketData: any) {
  if (!bracketData) return null;
  
  const picks = Object.entries(bracketData.group_stage).reduce<AllGroupPicks>(
    (acc, [groupKey, groupPicks]: [string, any]) => {
      const groupId = groupKey.replace('Group_', '');
      acc[groupId] = {
        1: groupPicks.first,
        2: groupPicks.second,
        3: groupPicks.third,
      };
      return acc;
    },
    {}
  );

  return {
    picks,
    thirdPicks: bracketData.wildcards || [],
    knockoutPicks: bracketData.knockouts || {},
  };
}