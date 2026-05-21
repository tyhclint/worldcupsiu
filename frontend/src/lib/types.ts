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

export type GroupPicks = {
  [rank: number]: string; 
};

export type AllGroupPicks = {
  [groupId: string]: GroupPicks;
};

export type PredictorTab = 'groups' | 'third' | 'bracket';