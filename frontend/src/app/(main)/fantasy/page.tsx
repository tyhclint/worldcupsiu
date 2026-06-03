'use client';

import { useEffect, useState } from 'react';
import {
  getFantasySquad,
  retrieveFantasySquadPayload,
  saveFantasySquadPayload,
  type FantasyPlayer,
  type FantasySelectedPlayer,
  type FantasySquadPayload,
  type FantasySquad,
} from '@/src/app/api/api';
import FantasyCountryFlag from '@/src/components/FantasyCountryFlag';

const benchSlots = ['GKP', 'DEF', 'MID', 'FWD'];
const defenderOptions = [3, 4, 5];
const midfielderOptions = [2, 3, 4, 5];
const forwardOptions = [1, 2, 3];

const countries = [
  { code: 'ALG', name: 'Algeria' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'AUS', name: 'Australia' },
  { code: 'AUT', name: 'Austria' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'BOS', name: 'Bosnia & Herzegovina' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'CAN', name: 'Canada' },
  { code: 'CAP', name: 'Cape Verde' },
  { code: 'COL', name: 'Colombia' },
  { code: 'CON', name: 'Congo DR' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'CUR', name: 'Curacao' },
  { code: 'CZE', name: 'Czech Republic' },
  { code: 'ECU', name: 'Ecuador' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'ENG', name: 'England' },
  { code: 'FRA', name: 'France' },
  { code: 'GER', name: 'Germany' },
  { code: 'GHA', name: 'Ghana' },
  { code: 'HAI', name: 'Haiti' },
  { code: 'IRA', name: 'Iran' },
  { code: 'IRQ', name: 'Iraq' },
  { code: 'IVO', name: 'Ivory Coast' },
  { code: 'JAP', name: 'Japan' },
  { code: 'JOR', name: 'Jordan' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'MOR', name: 'Morocco' },
  { code: 'NET', name: 'Netherlands' },
  { code: 'NOR', name: 'Norway' },
  { code: 'NZL', name: 'New Zealand' },
  { code: 'PAN', name: 'Panama' },
  { code: 'PAR', name: 'Paraguay' },
  { code: 'POR', name: 'Portugal' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SAU', name: 'Saudi Arabia' },
  { code: 'SCO', name: 'Scotland' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'SOU', name: 'South Africa' },
  { code: 'SPA', name: 'Spain' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'SWI', name: 'Switzerland' },
  { code: 'TUN', name: 'Tunisia' },
  { code: 'TUR', name: 'Turkiye' },
  { code: 'URU', name: 'Uruguay' },
  { code: 'USA', name: 'USA' },
  { code: 'UZB', name: 'Uzbekistan' },
];

const countryNameByCode = Object.fromEntries(
  countries.map((country) => [country.code, country.name]),
);

const positionBySlot = {
  GKP: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Attacker',
} as const;

type SquadSlotLabel = keyof typeof positionBySlot;
type SquadSlotId = string;

type SquadSlotConfig = {
  id: SquadSlotId;
  label: SquadSlotLabel;
};

type Formation = {
  defenders: number;
  midfielders: number;
  forwards: number;
};

function buildPitchRows(formation: Formation): SquadSlotConfig[][] {
  return [
    [{ id: 'starter-gkp-1', label: 'GKP' }],
    Array.from({ length: formation.defenders }, (_, index) => ({
      id: `starter-def-${index + 1}`,
      label: 'DEF',
    })),
    Array.from({ length: formation.midfielders }, (_, index) => ({
      id: `starter-mid-${index + 1}`,
      label: 'MID',
    })),
    Array.from({ length: formation.forwards }, (_, index) => ({
      id: `starter-fwd-${index + 1}`,
      label: 'FWD',
    })),
  ];
}

function SquadSlot({
  label,
  player,
  onClick,
}: {
  label: SquadSlotLabel;
  player?: FantasySelectedPlayer;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-28 w-24 flex-col items-center justify-center overflow-hidden rounded-lg border border-white/30 bg-white/15 text-white shadow-sm transition hover:bg-white/25"
    >
      {player ? (
        <>
          <img
            src={player.photo}
            alt={player.name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <span className="mt-1 max-w-full truncate px-1 text-xs font-bold">{player.name}</span>
          <span className="text-[10px] uppercase text-white/70">{label}</span>
          <FantasyCountryFlag
            countryCode={player.country_code}
            label={player.name}
            className="text-sm"
            fallbackClassName="text-[10px] uppercase text-white/60"
          />
        </>
      ) : (
        <>
          <span className="text-xs font-bold">{label}</span>
          <span className="mt-2 text-[10px] uppercase text-white/70">Pick player</span>
        </>
      )}
    </button>
  );
}

export default function FantasyPage() {
  const [formation, setFormation] = useState<Formation>({
    defenders: 4,
    midfielders: 4,
    forwards: 2,
  });
  const [confirmedFormation, setConfirmedFormation] = useState<Formation | null>(null);
  const [activeSlot, setActiveSlot] = useState<SquadSlotConfig | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Record<SquadSlotId, FantasySelectedPlayer>>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [squad, setSquad] = useState<FantasySquad | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSavedFantasySquad, setHasSavedFantasySquad] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFantasySquad = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const data = await retrieveFantasySquadPayload();
        if (!data.fantasy_squad) return;

        setFormation(data.fantasy_squad.formation);
        setConfirmedFormation(data.fantasy_squad.formation);
        setHasSavedFantasySquad(true);
        setSelectedPlayers({
          ...data.fantasy_squad.starters,
          ...data.fantasy_squad.bench,
        });
      } catch (err) {
        console.error('Failed to load fantasy squad', err);
      }
    };

    void loadFantasySquad();

    const handleAuthChange = () => {
      void loadFantasySquad();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const openPicker = (slot: SquadSlotConfig) => {
    setActiveSlot(slot);
    setSelectedCountry(null);
    setSquad(null);
    setError(null);
  };

  const handleCountryPick = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    setIsLoading(true);
    setError(null);

    try {
      const data = await getFantasySquad(countryCode);
      setSquad(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load squad');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerPick = (player: FantasyPlayer) => {
    if (!activeSlot || !selectedCountry || !squad) return;
    if (getPlayerUnavailableReason(player)) return;

    setSelectedPlayers({
      ...selectedPlayers,
      [activeSlot.id]: {
        ...player,
        country_code: selectedCountry,
        team_id: squad.team.id,
      },
    });

    setActiveSlot(null);
    setSelectedCountry(null);
    setSquad(null);
    setError(null);
  };

  const selectedPlayersOutsideActiveSlot = Object.entries(selectedPlayers)
    .filter(([slotId]) => slotId !== activeSlot?.id)
    .map(([, player]) => player);

  const getPlayerUnavailableReason = (player: FantasyPlayer) => {
    if (!squad) return null;

    const alreadySelected = selectedPlayersOutsideActiveSlot.some(
      (selectedPlayer) => selectedPlayer.id === player.id,
    );
    if (alreadySelected) return 'Already selected';

    const teamCount = selectedPlayersOutsideActiveSlot.filter(
      (selectedPlayer) => selectedPlayer.team_id === squad.team.id,
    ).length;
    if (teamCount >= 2) return 'Max 2 players from this team';

    return null;
  };

  const submitSquad = async () => {
    if (!confirmedFormation) return;

    const starters = Object.fromEntries(
      Object.entries(selectedPlayers).filter(([slotId]) => slotId.startsWith('starter-')),
    );
    const bench = Object.fromEntries(
      Object.entries(selectedPlayers).filter(([slotId]) => slotId.startsWith('bench-')),
    );
    const payload: FantasySquadPayload = {
      formation: confirmedFormation,
      starters,
      bench,
    };

    setSubmitStatus('submitting');
    setSubmitMessage('');

    try {
      await saveFantasySquadPayload(payload);
      const successMessage = hasSavedFantasySquad ? 'Fantasy squad updated.' : 'Fantasy squad saved.';
      setHasSavedFantasySquad(true);
      setSubmitStatus('success');
      setSubmitMessage(successMessage);
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'Failed to save fantasy squad.');
    }
  };

  const eligiblePlayers = activeSlot
    ? squad?.players.filter((player) => player.position === positionBySlot[activeSlot.label]) ?? []
    : [];
  const outfieldTotal = formation.defenders + formation.midfielders + formation.forwards;
  const canConfirmFormation = outfieldTotal === 10;
  const pitchRows = confirmedFormation ? buildPitchRows(confirmedFormation) : [];
  const selectedPlayerCount = Object.keys(selectedPlayers).length;
  const requiredPlayerCount = confirmedFormation ? 11 + benchSlots.length : 0;
  const canSubmitSquad = confirmedFormation && selectedPlayerCount === requiredPlayerCount;

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">World Cup Fantasy</p>
            <h1 className="text-3xl font-bold text-gray-900">Create Squad</h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Points</p>
            <p className="text-2xl font-semibold text-gray-900">0</p>
          </div>
        </div>

        {!confirmedFormation ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Choose your formation</h2>
              <p className="mt-1 text-sm text-gray-500">
                Pick 10 outfield players before building your squad.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Defenders
                <select
                  value={formation.defenders}
                  onChange={(event) => setFormation({
                    ...formation,
                    defenders: Number(event.target.value),
                  })}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  {defenderOptions.map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Midfielders
                <select
                  value={formation.midfielders}
                  onChange={(event) => setFormation({
                    ...formation,
                    midfielders: Number(event.target.value),
                  })}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  {midfielderOptions.map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Forwards
                <select
                  value={formation.forwards}
                  onChange={(event) => setFormation({
                    ...formation,
                    forwards: Number(event.target.value),
                  })}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  {forwardOptions.map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className={canConfirmFormation ? 'text-sm text-gray-500' : 'text-sm text-red-500'}>
                Outfield total: {outfieldTotal}/10
              </p>
              <button
                disabled={!canConfirmFormation}
                onClick={() => setConfirmedFormation(formation)}
                className="rounded-md bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Create squad
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-end gap-3">
              {submitMessage && (
                <p className={submitStatus === 'error' ? 'text-sm text-red-500' : 'text-sm text-green-600'}>
                  {submitMessage}
                </p>
              )}
              <button
                disabled={!canSubmitSquad || submitStatus === 'submitting'}
                onClick={submitSquad}
                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {submitStatus === 'submitting'
                  ? hasSavedFantasySquad ? 'Updating...' : 'Submitting...'
                  : hasSavedFantasySquad ? 'Update squad' : 'Submit squad'}
              </button>
              <button
                onClick={() => {
                  setConfirmedFormation(null);
                  setSelectedPlayers({});
                  setSubmitStatus('idle');
                  setSubmitMessage('');
                }}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Change formation
              </button>
            </div>

            <div className="rounded-xl bg-green-700 p-4 shadow-sm">
              <div className="space-y-8 rounded-lg border-2 border-white/70 bg-green-600 px-4 py-8">
                {pitchRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-6">
                    {row.map((slot) => (
                      <SquadSlot
                        key={slot.id}
                        label={slot.label}
                        player={selectedPlayers[slot.id]}
                        onClick={() => openPicker(slot)}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-white/20 p-4">
                <p className="mb-3 text-center text-sm font-bold uppercase text-white">Substitutes</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {benchSlots.map((slot, index) => (
                    <SquadSlot
                      key={`${slot}-${index}`}
                      label={slot as SquadSlotLabel}
                      player={selectedPlayers[`bench-${slot.toLowerCase()}-${index + 1}`]}
                      onClick={() => openPicker({
                        id: `bench-${slot.toLowerCase()}-${index + 1}`,
                        label: slot as SquadSlotLabel,
                      })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pick {activeSlot.label}</p>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCountry ? 'Choose a player' : 'Choose a country'}
                </h2>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            {!selectedCountry ? (
              <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountryPick(country.code)}
                    className="rounded-md border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setSelectedCountry(null);
                    setSquad(null);
                    setError(null);
                  }}
                  className="mb-3 text-sm font-semibold text-gray-500 hover:text-gray-900"
                >
                  Back to countries
                </button>

                {isLoading && <p className="text-sm text-gray-500">Loading players...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}

                {!isLoading && !error && (
                  <div className="grid max-h-96 gap-2 overflow-y-auto">
                    {eligiblePlayers.map((player) => {
                      const unavailableReason = getPlayerUnavailableReason(player);

                      return (
                        <button
                          key={player.id}
                          disabled={!!unavailableReason}
                          onClick={() => handlePlayerPick(player)}
                          className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{player.name}</p>
                              <p className="text-xs text-gray-500">{player.position}</p>
                              <p className="text-xs text-gray-400">
                                {selectedCountry ? countryNameByCode[selectedCountry] ?? selectedCountry : ''}
                              </p>
                              {unavailableReason && (
                                <p className="text-xs text-red-500">{unavailableReason}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-gray-400">
                            #{player.number ?? '-'}
                          </span>
                        </button>
                      );
                    })}

                    {squad && eligiblePlayers.length === 0 && (
                      <p className="text-sm text-gray-500">No players available for this position.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
