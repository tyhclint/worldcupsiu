import { Group } from './types';

export const GROUPS: Group[] = [
  {
    id: 'A',
    name: 'Group A',
    teams: [
      { id: 'mexico', name: 'Mexico', flag: '🇲🇽' },
      { id: 'south-korea', name: 'South Korea', flag: '🇰🇷' },
      { id: 'south-africa', name: 'South Africa', flag: '🇿🇦' },
      { id: 'czechia', name: 'Czechia', flag: '🇨🇿' },
    ],
  },
  {
    id: 'B',
    name: 'Group B',
    teams: [
      { id: 'canada', name: 'Canada', flag: '🇨🇦' },
      { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭' },
      { id: 'qatar', name: 'Qatar', flag: '🇶🇦' },
      { id: 'bosnia', name: 'Bosnia-Herzegovina', flag: '🇧🇦' },
    ],
  },
  {
    id: 'C',
    name: 'Group C',
    teams: [
      { id: 'brazil', name: 'Brazil', flag: '🇧🇷' },
      { id: 'morocco', name: 'Morocco', flag: '🇲🇦' },
      { id: 'scotland', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
      { id: 'haiti', name: 'Haiti', flag: '🇭🇹' },
    ],
  },
  {
    id: 'D',
    name: 'Group D',
    teams: [
      { id: 'usa', name: 'USA', flag: '🇺🇸' },
      { id: 'australia', name: 'Australia', flag: '🇦🇺' },
      { id: 'paraguay', name: 'Paraguay', flag: '🇵🇾' },
      { id: 'turkiye', name: 'Türkiye', flag: '🇹🇷' },
    ],
  },
  {
    id: 'E',
    name: 'Group E',
    teams: [
      { id: 'germany', name: 'Germany', flag: '🇩🇪' },
      { id: 'curacao', name: 'Curaçao', flag: '🇨🇼' },
      { id: 'ivory-coast', name: 'Cote d\'Ivoire', flag: '🇨🇮' },
      { id: 'ecuador', name: 'Ecuador', flag: '🇪🇨' },
    ],
  },
  {
    id: 'F',
    name: 'Group F',
    teams: [
      { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱' },
      { id: 'japan', name: 'Japan', flag: '🇯🇵' },
      { id: 'tunisia', name: 'Tunisia', flag: '🇹🇳' },
      { id: 'sweden', name: 'Sweden', flag: '🇸🇪' },
    ],
  },
  {
    id: 'G',
    name: 'Group G',
    teams: [
      { id: 'belgium', name: 'Belgium', flag: '🇧🇪' },
      { id: 'egypt', name: 'Egypt', flag: '🇪🇬' },
      { id: 'iran', name: 'Iran', flag: '🇮🇷' },
      { id: 'new-zealand', name: 'New Zealand', flag: '🇳🇿' },
    ],
  },
  {
    id: 'H',
    name: 'Group H',
    teams: [
      { id: 'spain', name: 'Spain', flag: '🇪🇸' },
      { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾' },
      { id: 'saudi-arabia', name: 'Saudi Arabia', flag: '🇸🇦' },
      { id: 'cabo-verde', name: 'Cape Verde', flag: '🇨🇻' },
    ],
  },
  {
    id: 'I',
    name: 'Group I',
    teams: [
      { id: 'france', name: 'France', flag: '🇫🇷' },
      { id: 'senegal', name: 'Senegal', flag: '🇸🇳' },
      { id: 'norway', name: 'Norway', flag: '🇳🇴' },
      { id: 'iraq', name: 'Iraq', flag: '🇮🇶' },
    ],
  },
  {
    id: 'J',
    name: 'Group J',
    teams: [
      { id: 'argentina', name: 'Argentina', flag: '🇦🇷' },
      { id: 'austria', name: 'Austria', flag: '🇦🇹' },
      { id: 'algeria', name: 'Algeria', flag: '🇩🇿' },
      { id: 'jordan', name: 'Jordan', flag: '🇯🇴' },
    ],
  },
  {
    id: 'K',
    name: 'Group K',
    teams: [
      { id: 'portugal', name: 'Portugal', flag: '🇵🇹' },
      { id: 'colombia', name: 'Colombia', flag: '🇨🇴' },
      { id: 'uzbekistan', name: 'Uzbekistan', flag: '🇺🇿' },
      { id: 'congo-dr', name: 'DR Congo', flag: '🇨🇩' },
    ],
  },
  {
    id: 'L',
    name: 'Group L',
    teams: [
      { id: 'england', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { id: 'croatia', name: 'Croatia', flag: '🇭🇷' },
      { id: 'ghana', name: 'Ghana', flag: '🇬🇭' },
      { id: 'panama', name: 'Panama', flag: '🇵🇦' },
    ],
  },
];

export function getTeamById(id: string) {
  for (const g of GROUPS) {
    const team = g.teams.find((t) => t.id === id);
    if (team) return team;
  }
  return null;
}