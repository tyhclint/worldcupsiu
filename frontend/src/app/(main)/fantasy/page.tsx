'use client';

import { useState } from 'react';
import { getFantasySquad, type FantasyPlayer, type FantasySquad } from '@/src/app/api/api';

const benchSlots = ['GKP', 'DEF', 'MID', 'FWD'];
const defenderOptions = [3, 4, 5];
const midfielderOptions = [2, 3, 4, 5];
const forwardOptions = [1, 2, 3];

const countries = [
  { code: 'ARG', name: 'Argentina' },
  { code: 'AUS', name: 'Australia' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'CAM', name: 'Cameroon' },
  { code: 'CAN', name: 'Canada' },
  { code: 'COS', name: 'Costa Rica' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'DEN', name: 'Denmark' },
  { code: 'ECU', name: 'Ecuador' },
  { code: 'ENG', name: 'England' },
  { code: 'FRA', name: 'France' },
  { code: 'GER', name: 'Germany' },
  { code: 'GHA', name: 'Ghana' },
  { code: 'IRA', name: 'Iran' },
  { code: 'JAP', name: 'Japan' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'MOR', name: 'Morocco' },
  { code: 'NET', name: 'Netherlands' },
  { code: 'POL', name: 'Poland' },
  { code: 'POR', name: 'Portugal' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SAU', name: 'Saudi Arabia' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'SER', name: 'Serbia' },
  { code: 'SPA', name: 'Spain' },
  { code: 'SWI', name: 'Switzerland' },
  { code: 'TUN', name: 'Tunisia' },
  { code: 'URU', name: 'Uruguay' },
  { code: 'USA', name: 'USA' },
  { code: 'WAL', name: 'Wales' },
];

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

type SelectedPlayer = FantasyPlayer & {
  countryCode: string;
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
  player?: SelectedPlayer;
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
  const [selectedPlayers, setSelectedPlayers] = useState<Record<SquadSlotId, SelectedPlayer>>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [squad, setSquad] = useState<FantasySquad | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!activeSlot || !selectedCountry) return;

    setSelectedPlayers({
      ...selectedPlayers,
      [activeSlot.id]: {
        ...player,
        countryCode: selectedCountry,
      },
    });

    setActiveSlot(null);
    setSelectedCountry(null);
    setSquad(null);
    setError(null);
  };

  const eligiblePlayers = activeSlot
    ? squad?.players.filter((player) => player.position === positionBySlot[activeSlot.label]) ?? []
    : [];
  const outfieldTotal = formation.defenders + formation.midfielders + formation.forwards;
  const canConfirmFormation = outfieldTotal === 10;
  const pitchRows = confirmedFormation ? buildPitchRows(confirmedFormation) : [];

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
            <div className="flex justify-end">
              <button
                onClick={() => setConfirmedFormation(null)}
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
                    {eligiblePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerPick(player)}
                        className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50"
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
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-400">
                          #{player.number ?? '-'}
                        </span>
                      </button>
                    ))}

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
