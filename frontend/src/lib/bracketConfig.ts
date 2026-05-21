import type { GroupId, KnockoutMatchId } from './types';

export type RoundId = 'round_of_32' | 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'final';

type GroupRankSource = {
  type: 'group_rank';
  group: GroupId;
  rank: 1 | 2;
};

type ThirdPlaceSource = {
  type: 'third_place';
  matchId: Extract<KnockoutMatchId, 'M74' | 'M77' | 'M79' | 'M80' | 'M81' | 'M82' | 'M85' | 'M87'>;
};

type WinnerSource = {
  type: 'winner';
  matchId: KnockoutMatchId;
};

export type TeamSource = GroupRankSource | ThirdPlaceSource | WinnerSource;

export type MatchConfig = {
  id: KnockoutMatchId;
  round: RoundId;
  label: string;
  teamA: TeamSource;
  teamB: TeamSource;
};

export type ThirdPlaceAllocation = {
  option: number;
  M74: GroupId;
  M77: GroupId;
  M79: GroupId;
  M80: GroupId;
  M81: GroupId;
  M82: GroupId;
  M85: GroupId;
  M87: GroupId;
};

export const ROUND_LABELS: Record<RoundId, string> = {
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarter_finals: 'Quarter-finals',
  semi_finals: 'Semi-finals',
  final: 'Final',
};

export const ROUND_ORDER: RoundId[] = [
  'round_of_32',
  'round_of_16',
  'quarter_finals',
  'semi_finals',
  'final',
];

export const KNOCKOUT_MATCHES: MatchConfig[] = [
  { id: 'M73', round: 'round_of_32', label: 'Match 73', teamA: { type: 'group_rank', group: 'A', rank: 2 }, teamB: { type: 'group_rank', group: 'B', rank: 2 } },
  { id: 'M74', round: 'round_of_32', label: 'Match 74', teamA: { type: 'group_rank', group: 'E', rank: 1 }, teamB: { type: 'third_place', matchId: 'M74' } },
  { id: 'M75', round: 'round_of_32', label: 'Match 75', teamA: { type: 'group_rank', group: 'F', rank: 1 }, teamB: { type: 'group_rank', group: 'C', rank: 2 } },
  { id: 'M76', round: 'round_of_32', label: 'Match 76', teamA: { type: 'group_rank', group: 'C', rank: 1 }, teamB: { type: 'group_rank', group: 'F', rank: 2 } },
  { id: 'M77', round: 'round_of_32', label: 'Match 77', teamA: { type: 'group_rank', group: 'I', rank: 1 }, teamB: { type: 'third_place', matchId: 'M77' } },
  { id: 'M78', round: 'round_of_32', label: 'Match 78', teamA: { type: 'group_rank', group: 'E', rank: 2 }, teamB: { type: 'group_rank', group: 'I', rank: 2 } },
  { id: 'M79', round: 'round_of_32', label: 'Match 79', teamA: { type: 'group_rank', group: 'A', rank: 1 }, teamB: { type: 'third_place', matchId: 'M79' } },
  { id: 'M80', round: 'round_of_32', label: 'Match 80', teamA: { type: 'group_rank', group: 'L', rank: 1 }, teamB: { type: 'third_place', matchId: 'M80' } },
  { id: 'M81', round: 'round_of_32', label: 'Match 81', teamA: { type: 'group_rank', group: 'D', rank: 1 }, teamB: { type: 'third_place', matchId: 'M81' } },
  { id: 'M82', round: 'round_of_32', label: 'Match 82', teamA: { type: 'group_rank', group: 'G', rank: 1 }, teamB: { type: 'third_place', matchId: 'M82' } },
  { id: 'M83', round: 'round_of_32', label: 'Match 83', teamA: { type: 'group_rank', group: 'K', rank: 2 }, teamB: { type: 'group_rank', group: 'L', rank: 2 } },
  { id: 'M84', round: 'round_of_32', label: 'Match 84', teamA: { type: 'group_rank', group: 'H', rank: 1 }, teamB: { type: 'group_rank', group: 'J', rank: 2 } },
  { id: 'M85', round: 'round_of_32', label: 'Match 85', teamA: { type: 'group_rank', group: 'B', rank: 1 }, teamB: { type: 'third_place', matchId: 'M85' } },
  { id: 'M86', round: 'round_of_32', label: 'Match 86', teamA: { type: 'group_rank', group: 'J', rank: 1 }, teamB: { type: 'group_rank', group: 'H', rank: 2 } },
  { id: 'M87', round: 'round_of_32', label: 'Match 87', teamA: { type: 'group_rank', group: 'K', rank: 1 }, teamB: { type: 'third_place', matchId: 'M87' } },
  { id: 'M88', round: 'round_of_32', label: 'Match 88', teamA: { type: 'group_rank', group: 'D', rank: 2 }, teamB: { type: 'group_rank', group: 'G', rank: 2 } },
  { id: 'M89', round: 'round_of_16', label: 'Match 89', teamA: { type: 'winner', matchId: 'M74' }, teamB: { type: 'winner', matchId: 'M77' } },
  { id: 'M90', round: 'round_of_16', label: 'Match 90', teamA: { type: 'winner', matchId: 'M73' }, teamB: { type: 'winner', matchId: 'M75' } },
  { id: 'M91', round: 'round_of_16', label: 'Match 91', teamA: { type: 'winner', matchId: 'M76' }, teamB: { type: 'winner', matchId: 'M78' } },
  { id: 'M92', round: 'round_of_16', label: 'Match 92', teamA: { type: 'winner', matchId: 'M79' }, teamB: { type: 'winner', matchId: 'M80' } },
  { id: 'M93', round: 'round_of_16', label: 'Match 93', teamA: { type: 'winner', matchId: 'M83' }, teamB: { type: 'winner', matchId: 'M84' } },
  { id: 'M94', round: 'round_of_16', label: 'Match 94', teamA: { type: 'winner', matchId: 'M81' }, teamB: { type: 'winner', matchId: 'M82' } },
  { id: 'M95', round: 'round_of_16', label: 'Match 95', teamA: { type: 'winner', matchId: 'M86' }, teamB: { type: 'winner', matchId: 'M88' } },
  { id: 'M96', round: 'round_of_16', label: 'Match 96', teamA: { type: 'winner', matchId: 'M85' }, teamB: { type: 'winner', matchId: 'M87' } },
  { id: 'M97', round: 'quarter_finals', label: 'Match 97', teamA: { type: 'winner', matchId: 'M89' }, teamB: { type: 'winner', matchId: 'M90' } },
  { id: 'M98', round: 'quarter_finals', label: 'Match 98', teamA: { type: 'winner', matchId: 'M93' }, teamB: { type: 'winner', matchId: 'M94' } },
  { id: 'M99', round: 'quarter_finals', label: 'Match 99', teamA: { type: 'winner', matchId: 'M91' }, teamB: { type: 'winner', matchId: 'M92' } },
  { id: 'M100', round: 'quarter_finals', label: 'Match 100', teamA: { type: 'winner', matchId: 'M95' }, teamB: { type: 'winner', matchId: 'M96' } },
  { id: 'M101', round: 'semi_finals', label: 'Match 101', teamA: { type: 'winner', matchId: 'M97' }, teamB: { type: 'winner', matchId: 'M98' } },
  { id: 'M102', round: 'semi_finals', label: 'Match 102', teamA: { type: 'winner', matchId: 'M99' }, teamB: { type: 'winner', matchId: 'M100' } },
  { id: 'M104', round: 'final', label: 'Match 104', teamA: { type: 'winner', matchId: 'M101' }, teamB: { type: 'winner', matchId: 'M102' } },
];

export const REQUIRED_KNOCKOUT_MATCH_IDS = KNOCKOUT_MATCHES.map((match) => match.id);

export const DOWNSTREAM_MATCH_IDS: Record<KnockoutMatchId, KnockoutMatchId[]> = {
  M73: ['M90', 'M97', 'M101', 'M104'],
  M74: ['M89', 'M97', 'M101', 'M104'],
  M75: ['M90', 'M97', 'M101', 'M104'],
  M76: ['M91', 'M99', 'M102', 'M104'],
  M77: ['M89', 'M97', 'M101', 'M104'],
  M78: ['M91', 'M99', 'M102', 'M104'],
  M79: ['M92', 'M99', 'M102', 'M104'],
  M80: ['M92', 'M99', 'M102', 'M104'],
  M81: ['M94', 'M98', 'M101', 'M104'],
  M82: ['M94', 'M98', 'M101', 'M104'],
  M83: ['M93', 'M98', 'M101', 'M104'],
  M84: ['M93', 'M98', 'M101', 'M104'],
  M85: ['M96', 'M100', 'M102', 'M104'],
  M86: ['M95', 'M100', 'M102', 'M104'],
  M87: ['M96', 'M100', 'M102', 'M104'],
  M88: ['M95', 'M100', 'M102', 'M104'],
  M89: ['M97', 'M101', 'M104'],
  M90: ['M97', 'M101', 'M104'],
  M91: ['M99', 'M102', 'M104'],
  M92: ['M99', 'M102', 'M104'],
  M93: ['M98', 'M101', 'M104'],
  M94: ['M98', 'M101', 'M104'],
  M95: ['M100', 'M102', 'M104'],
  M96: ['M100', 'M102', 'M104'],
  M97: ['M101', 'M104'],
  M98: ['M101', 'M104'],
  M99: ['M102', 'M104'],
  M100: ['M102', 'M104'],
  M101: ['M104'],
  M102: ['M104'],
  M104: [],
};
