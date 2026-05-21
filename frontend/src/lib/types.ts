export type Team = {
  id: string;
  name: string;
  flag: string;
};

export type Group = {
  id: string;
  name: string;
  teams: Team[];
};

export type GroupId =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L';

export type GroupKey =
  | 'Group_A'
  | 'Group_B'
  | 'Group_C'
  | 'Group_D'
  | 'Group_E'
  | 'Group_F'
  | 'Group_G'
  | 'Group_H'
  | 'Group_I'
  | 'Group_J'
  | 'Group_K'
  | 'Group_L';

export type GroupPicks = {
  [rank: number]: string; 
};

export type AllGroupPicks = {
  [groupId: string]: GroupPicks;
};

export type KnockoutMatchId =
  | 'M73'
  | 'M74'
  | 'M75'
  | 'M76'
  | 'M77'
  | 'M78'
  | 'M79'
  | 'M80'
  | 'M81'
  | 'M82'
  | 'M83'
  | 'M84'
  | 'M85'
  | 'M86'
  | 'M87'
  | 'M88'
  | 'M89'
  | 'M90'
  | 'M91'
  | 'M92'
  | 'M93'
  | 'M94'
  | 'M95'
  | 'M96'
  | 'M97'
  | 'M98'
  | 'M99'
  | 'M100'
  | 'M101'
  | 'M102'
  | 'M104';

export type KnockoutPicks = Partial<Record<KnockoutMatchId, string>>;

export type BracketDataPayload = {
  group_stage: Record<GroupKey, {
    first: string;
    second: string;
    third: string;
  }>;
  wildcards: string[];
  knockouts: Record<KnockoutMatchId, string>;
};

export type CreatePredictionRequest = {
  bracket_data: BracketDataPayload;
};

export type PredictorTab = 'groups' | 'third' | 'bracket';
