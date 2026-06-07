'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  getFantasySquad,
  retrieveFantasySquadPayload,
  saveFantasySquadPayload,
  scoreFantasySquadPayload,
  type FantasyPlayer,
  type FantasySelectedPlayer,
  type FantasySquadPayload,
  type FantasySquad,
} from '@/src/app/api/api';
import FantasyCountryFlag from '@/src/components/FantasyCountryFlag';
import FantasyTutorialModal from '@/src/components/FantasyTutorial';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';
import { toast } from 'sonner';

// --- 1. NEW 16-SLOT DEFINITION ---
const SLOTS = [
  // 11 Starters
  { id: 'starter-gkp-1', label: 'GKP', allowedPositions: ['Goalkeeper'], originalRole: 'Goalkeeper' },
  ...Array.from({ length: 4 }, (_, i) => ({ id: `starter-def-${i + 1}`, label: 'DEF', allowedPositions: ['Defender'], originalRole: 'Defender' })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `starter-mid-${i + 1}`, label: 'MID', allowedPositions: ['Midfielder'], originalRole: 'Midfielder' })),
  ...Array.from({ length: 2 }, (_, i) => ({ id: `starter-fwd-${i + 1}`, label: 'FWD', allowedPositions: ['Attacker'], originalRole: 'Attacker' })),
  
  // 5 Bench (GK, DEF, MID, FWD, and WC)
  { id: 'bench-gkp-1', label: 'GKP', allowedPositions: ['Goalkeeper'], originalRole: 'Goalkeeper' }, // Restored bench GK!
  { id: 'bench-def-1', label: 'DEF', allowedPositions: ['Defender'], originalRole: 'Defender' },
  { id: 'bench-mid-1', label: 'MID', allowedPositions: ['Midfielder'], originalRole: 'Midfielder' },
  { id: 'bench-fwd-1', label: 'FWD', allowedPositions: ['Attacker'], originalRole: 'Attacker' },
  { id: 'bench-wc-1', label: 'WC', allowedPositions: ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'], originalRole: 'Wildcard' },
];

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

const DraftSlotCard = memo(function DraftSlotCard({ slot, player, onClick } : 
  { slot: any, player?: FantasySelectedPlayer, onClick: () => void }) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: slot.id });
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: slot.id,
    disabled: !player,
  });

  const isWildcard = slot.id === 'bench-wc-1';

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    // Droppable is the outer container
    <div ref={setDroppableRef} className={`rounded-xl transition-all ${isOver ? 'scale-110 ring-4 ring-yellow-400' : ''}`}>
      {/* Draggable handle is separate from the click target */}
      <div
        ref={setDraggableRef}
        style={style}
        {...(player ? { ...attributes, ...listeners } : {})}
      >
        <button
          onClick={onClick}
          className={`relative flex h-28 w-[4.25rem] sm:w-24 flex-col items-center justify-center overflow-hidden rounded-lg border text-white shadow-sm transition hover:scale-105 ${
            player
              ? 'border-white/50 bg-white/20 cursor-grab active:cursor-grabbing'
              : isWildcard
              ? 'border-dashed border-yellow-400 bg-yellow-400/20 cursor-pointer'
              : 'border-white/30 bg-white/10 hover:bg-white/20 cursor-pointer'
          }`}
        >
          {player ? (
            <>
              <span className="absolute left-1.5 top-0.5 z-10">
                <FantasyCountryFlag
                  countryCode={player.country_code}
                  label={player.name}
                  className="text-sm shadow-sm"
                  fallbackClassName="text-[9px] font-bold"
                />
              </span>
              <img src={player.photo} alt={player.name} className="h-14 w-14 rounded-full object-cover" />
              <span className="mt-1 max-w-full truncate px-1 text-xs font-bold">{player.name}</span>
              <span className="text-[10px] uppercase text-white/70">{player.position}</span>
            </>
          ) : (
            <>
              <span className="mb-1 text-2xl">{isWildcard ? '🌟' : '+'}</span>
              <span className="text-[10px] sm:text-xs font-bold text-center leading-tight px-1">{slot.label}</span>
              <span className="mt-1 text-[8px] uppercase text-white/50">Pick Player</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default function FantasyPage() {
  const [draftedPlayers, setDraftedPlayers] = useState<Record<string, FantasySelectedPlayer>>({});
  const [activeSlot, setActiveSlot] = useState<any | null>(null);
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [squad, setSquad] = useState<FantasySquad | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSavedFantasySquad, setHasSavedFantasySquad] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [fantasyScore, setFantasyScore] = useState<number | null>(null);
  const [savedSquadKey, setSavedSquadKey] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pitchRows, benchRow } = useMemo(() => {
    const rows: Record<string, any[]> = { Goalkeeper: [], Defender: [], Midfielder: [], Attacker: [] };
    const bench: any[] = [];

    SLOTS.forEach(slot => {
      const player = draftedPlayers[slot.id];
      if (slot.id.startsWith('starter-')) {
        const position = player ? player.position : slot.originalRole;
        if (rows[position]) rows[position].push(slot);
      } else {
        bench.push(slot);
      }
    });

    return { 
      pitchRows: [rows.Goalkeeper, rows.Defender, rows.Midfielder, rows.Attacker],
      benchRow: bench
    };
  }, [draftedPlayers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent)=> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceId = active.id.toString();
    const targetId = over.id.toString();

    setDraftedPlayers((prev) => {
      const newDraft = { ...prev };
      const sourcePlayer = newDraft[sourceId];
      const targetPlayer = newDraft[targetId];

      if (targetPlayer) newDraft[sourceId] = targetPlayer;
      else delete newDraft[sourceId];

      if (sourcePlayer) newDraft[targetId] = sourcePlayer;
      else delete newDraft[targetId];

      // Validator checks everyone on the pitch
      let defs = 0, mids = 0, fwds = 0, gkps = 0;
      
      SLOTS.filter(s => s.id.startsWith('starter-')).forEach(slot => {
        const p = newDraft[slot.id];
        const pos = p ? p.position : slot.originalRole;
        if (pos === 'Defender') defs++;
        if (pos === 'Midfielder') mids++;
        if (pos === 'Attacker') fwds++;
        if (pos === 'Goalkeeper') gkps++;
      });

      if (gkps !== 1) {
        setSubmitStatus('error');
        toast.error("You must have exactly 1 Goalkeeper on the pitch.");
        return prev;
      }

      if (defs < 3 || defs > 5 || mids < 3 || mids > 5 || fwds < 1 || fwds > 3) {
        setSubmitStatus('error');
        toast.error(`Invalid Formation! You cannot play a ${defs}-${mids}-${fwds}.`);
        return prev; 
      }

      setSubmitStatus('idle');
      return newDraft; 
    });
  }, []);

  useEffect(() => {
    const loadFantasySquad = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const data = await retrieveFantasySquadPayload();
        if (!data.fantasy_squad) return;

        setHasSavedFantasySquad(true);
        setDraftedPlayers({
          ...data.fantasy_squad.starters,
          ...data.fantasy_squad.bench,
        });
        setSavedSquadKey(JSON.stringify(data.fantasy_squad));
        setFantasyScore(data.fantasy_score);
      } catch (err) {
        console.error('Failed to load fantasy squad', err);
      }
    };

    void loadFantasySquad();
    const handleAuthChange = () => void loadFantasySquad();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

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

    setDraftedPlayers({
      ...draftedPlayers,
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

  const draftedPlayersOutsideActiveSlot = Object.entries(draftedPlayers)
    .filter(([slotId]) => slotId !== activeSlot?.id)
    .map(([, player]) => player);

  const getPlayerUnavailableReason = (player: FantasyPlayer) => {
    if (!squad) return null;

    const alreadySelected = draftedPlayersOutsideActiveSlot.some(
      (draftedPlayer) => draftedPlayer.id === player.id,
    );
    if (alreadySelected) return 'Already selected';

    const teamCount = draftedPlayersOutsideActiveSlot.filter(
      (draftedPlayer) => draftedPlayer.team_id === squad.team.id,
    ).length;
    if (teamCount >= 1) return 'Max 1 player from each country';

    return null;
  };

  const fantasySquadPayload = useMemo<FantasySquadPayload | null>(() => {
    // UPDATED to 16
    if (Object.keys(draftedPlayers).length < 16) return null;

    const starters: Record<string, FantasySelectedPlayer> = {};
    const bench: Record<string, FantasySelectedPlayer> = {};
    let defs = 0, mids = 0, fwds = 0;

    Object.entries(draftedPlayers).forEach(([slotId, player]) => {
      if (slotId.startsWith('starter-')) {
        starters[slotId] = player;
        if (slotId.includes('-def-')) defs++;
        if (slotId.includes('-mid-')) mids++;
        if (slotId.includes('-fwd-')) fwds++;
      } else if (slotId.startsWith('bench-')) {
        bench[slotId] = player;
      }
    });

    return {
      formation: { defenders: defs, midfielders: mids, forwards: fwds },
      starters,
      bench,
    };
  }, [draftedPlayers]);

  const fantasySquadKey = fantasySquadPayload ? JSON.stringify(fantasySquadPayload) : null;
  const hasUnsavedFantasySquadChanges = !hasSavedFantasySquad || fantasySquadKey !== savedSquadKey;

  const submitSquad = async () => {
    if (!fantasySquadPayload) return;
    setSubmitStatus('submitting');

    try {
      const data = await saveFantasySquadPayload(fantasySquadPayload);
      const successMessage = hasSavedFantasySquad ? 'Fantasy squad updated.' : 'Fantasy squad saved.';
      setHasSavedFantasySquad(true);
      setFantasyScore(data.fantasy_score ?? null);
      setSavedSquadKey(fantasySquadKey);
      setSubmitStatus('success');
      toast.success(successMessage);
    } catch (err) {
      setSubmitStatus('error');
      toast.error(err instanceof Error ? err.message : 'Failed to save fantasy squad.');
    }
  };

  const scoreSquad = async () => {
    setSubmitStatus('submitting');

    try {
      const data = await scoreFantasySquadPayload();
      setFantasyScore(data.score);
      setSubmitStatus('success');
      toast.success('Fantasy squad scored.');
    } catch (err) {
      setSubmitStatus('error');
      toast.error(err instanceof Error ? err.message : 'Failed to score fantasy squad.');
    }
  };

  const eligiblePlayers = activeSlot
    ? squad?.players.filter((player) => activeSlot.allowedPositions.includes(player.position)) ?? []
    : [];

  const selectedPlayerCount = Object.keys(draftedPlayers).length;
  // UPDATED to 16
  const canSubmitSquad = Boolean(selectedPlayerCount === 16 && hasUnsavedFantasySquadChanges);

  return (
    <>
      <div className="mx-auto max-w-6xl px-2 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">World Cup Fantasy</p>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              Create Squad
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500 transition hover:bg-gray-300 hover:text-gray-900"
                title="How to play"
              >
                ?
              </button>
            </h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Points</p>
            <p className="text-2xl font-semibold text-gray-900">
              {fantasyScore === null ? '-' : fantasyScore.toFixed(2)}
            </p>
          </div>
        </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-900">Build Your Squad</h2>
            <span className="text-xl font-bold text-gray-900">
              {selectedPlayerCount} <span className="text-gray-400">/ 16</span>
            </span>
          </div>

          <div className="rounded-xl bg-green-700 p-2 shadow-sm sm:p-4">
            <div className="space-y-6 rounded-lg border-2 border-white/70 bg-green-600 px-2 py-8 sm:px-4">
              
              {pitchRows.map((row, rowIndex) => {
                if (row.length === 0) return null;
                return (
                  <div 
                    key={`pitch-row-${rowIndex}`} 
                    className="mx-auto flex w-max justify-center gap-1 rounded-3xl bg-white/10 px-2 py-3 sm:gap-4 sm:px-4 md:gap-6"
                  >
                    {row.map((slot) => (
                      <DraftSlotCard 
                        key={slot.id} 
                        slot={slot} 
                        player={draftedPlayers[slot.id]} 
                        onClick={() => setActiveSlot(slot)} 
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg bg-white/20 p-2 sm:p-4">
              <p className="mb-3 text-center text-sm font-bold uppercase text-white">Substitutes</p>
              
              <div className="mx-auto flex w-full justify-center gap-1 rounded-3xl bg-white/10 px-0 py-3 sm:w-max sm:gap-4 sm:px-4 md:gap-6">
                {benchRow.map((slot) => (
                  <DraftSlotCard 
                    key={slot.id} 
                    slot={slot} 
                    player={draftedPlayers[slot.id]} 
                    onClick={() => setActiveSlot(slot)} 
                  />
                ))}
              </div>

            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-4">
            <button
              onClick={() => {
                setDraftedPlayers({});
                setSubmitStatus('idle');
              }}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              disabled={!hasSavedFantasySquad || submitStatus === 'submitting'}
              onClick={scoreSquad}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white"
            >
              Score squad
            </button>
            <button
              disabled={!canSubmitSquad || submitStatus === 'submitting'}
              onClick={submitSquad}
              className="rounded-md bg-black px-6 py-2 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitStatus === 'submitting'
                ? hasSavedFantasySquad ? 'Updating...' : 'Submitting...'
                : hasSavedFantasySquad ? 'Update squad' : 'Submit squad'}
            </button>
          </div>
        </div>
        </DndContext>
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
              <div className="grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountryPick(country.code)}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-lg transition-transform duration-200 group-hover:scale-110">
                      <FantasyCountryFlag 
                        countryCode={country.code} 
                        label={country.name} 
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 transition-colors group-hover:text-black">
                      {country.name}
                    </span>
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
      
      {isTutorialOpen && (
        <FantasyTutorialModal onClose={() => setIsTutorialOpen(false)} />
      )}
    </>
  );
}
