'use client';

import { useMemo, useState } from 'react';
import { Send, Trophy } from 'lucide-react';
import { resolveMatchesByRound, type ResolvedTeam } from '@/src/lib/bracket';
import { ROUND_LABELS, ROUND_ORDER } from '@/src/lib/bracketConfig';
import { usePredictorStore } from '@/src/store/predictorStore';
import { cn } from '@/src/utils/merge';
import { submitBracketPayload, updateBracketPayload } from '@/src/app/api/api';

const MATCH_HEIGHT = 86;
const BASE_GAP = 16;
const CARD_WIDTH = 190;
const CONNECTOR_WIDTH = 34;
const HEADER_HEIGHT = 42;

const ROUND_DATES: Partial<Record<(typeof ROUND_ORDER)[number], string>> = {
  round_of_32: 'Jul 1-6',
  round_of_16: 'Jul 8-11',
  quarter_finals: 'Jul 13-14',
  semi_finals: 'Jul 16-17',
  final: 'Jul 19',
};

function TeamButton({
  team,
  selected,
  disabled,
  onClick,
}: {
  team: ResolvedTeam | null;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled || !team}
      onClick={onClick}
      className={cn(
        'flex h-7 w-full items-center justify-between px-2 text-left text-xs transition-all',
        // 1. Selected state: ALWAYS teal, even if read-only/disabled
        selected ? 'bg-teal-50 text-teal-700 font-medium' : 'bg-white text-gray-700',
        
        // 2. Interactive state: allow hover ONLY if it's not disabled and not selected
        !disabled && !selected && 'hover:bg-gray-50',
        
        // 3. Disabled & Unselected state: gray it out so the teal really pops
        (disabled || !team) && !selected && 'bg-gray-50 text-gray-400',
        
        // 4. Cursor logic: default arrow if selected, not-allowed if blank/disabled
        (disabled || !team) ? (selected ? 'cursor-default' : 'cursor-not-allowed') : 'cursor-pointer'
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className={cn(
          'text-base leading-none', 
          // Dim the flag if it's empty, or if it's an unselected team in read-only mode
          (!team || (disabled && !selected)) && 'opacity-50'
        )}>
          {team?.flag ?? '-'}
        </span>
        <span className="truncate">{team?.name ?? 'Awaiting winner'}</span>
      </span>
      <span className="ml-2 flex-shrink-0 text-[10px] font-semibold text-gray-400 opacity-70">
        {team?.seedLabel}
      </span>
    </button>
  );
}

function roundGap(roundIndex: number) {
  return (2 ** roundIndex) * (MATCH_HEIGHT + BASE_GAP) - MATCH_HEIGHT;
}

function roundTopPadding(roundIndex: number) {
  return ((2 ** roundIndex - 1) * (MATCH_HEIGHT + BASE_GAP)) / 2;
}

function matchTop(roundIndex: number, matchIndex: number) {
  return HEADER_HEIGHT + roundTopPadding(roundIndex) + (matchIndex * (MATCH_HEIGHT + roundGap(roundIndex)));
}

function matchCenter(roundIndex: number, matchIndex: number) {
  return matchTop(roundIndex, matchIndex) + (MATCH_HEIGHT / 2);
}

function ConnectorLines({
  roundIndex,
  matchCount,
  columnLeft,
}: {
  roundIndex: number;
  matchCount: number;
  columnLeft: number;
}) {
  if (matchCount <= 1) return null;

  const startX = columnLeft + CARD_WIDTH;
  const middleX = startX + Math.floor(CONNECTOR_WIDTH / 2);
  const endX = columnLeft + CARD_WIDTH + CONNECTOR_WIDTH;

  return (
    <>
      {Array.from({ length: matchCount / 2 }, (_, pairIndex) => {
        const firstCenter = matchCenter(roundIndex, pairIndex * 2);
        const secondCenter = matchCenter(roundIndex, (pairIndex * 2) + 1);
        const middle = (firstCenter + secondCenter) / 2;

        return (
          <div key={pairIndex}>
            <span
              className="absolute border-t border-gray-300"
              style={{ left: startX, top: firstCenter, width: middleX - startX }}
            />
            <span
              className="absolute border-t border-gray-300"
              style={{ left: startX, top: secondCenter, width: middleX - startX }}
            />
            <span
              className="absolute border-l border-gray-300"
              style={{ left: middleX, top: firstCenter, height: secondCenter - firstCenter }}
            />
            <span
              className="absolute border-t border-gray-300"
              style={{ left: middleX, top: middle, width: endX - middleX }}
            />
          </div>
        );
      })}
    </>
  );
}

interface BracketFormProps {
  readOnlyData?: {
    picks: any;
    thirdPicks: string[];
    knockoutPicks: any;
  } | null;
}

export default function BracketForm({ readOnlyData }: BracketFormProps) {
  const store = usePredictorStore();
  
  const isReadOnly = !!readOnlyData;
  const activePicks = isReadOnly ? readOnlyData.picks : store.picks;
  const activeThirdPicks = isReadOnly ? readOnlyData.thirdPicks : store.thirdPicks;
  const activeKnockoutPicks = isReadOnly ? readOnlyData.knockoutPicks : store.knockoutPicks;
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const matchesByRound = useMemo(
    () => resolveMatchesByRound(activePicks, activeThirdPicks, activeKnockoutPicks),
    [activePicks, activeThirdPicks, activeKnockoutPicks],
  );

  const champion = activeKnockoutPicks.M104;
  const championTeam = champion
    ? Object.values(matchesByRound).flat().find((match) => match.id === 'M104')?.winner
    : null;

  async function submitBracket() {
    const payload = store.buildPredictionPayload();
    if (!payload) {
      setSubmitStatus('error');
      setSubmitMessage('Complete every knockout match before submitting.');
      return;
    }

    setSubmitStatus('submitting');
    setSubmitMessage('');

    try {
      if (store.hasSavedBracket) {
        await updateBracketPayload(payload);
      } else {
        await submitBracketPayload(payload);
        store.markBracketSaved();
      }

      setSubmitStatus('success');
      setSubmitMessage(store.hasSavedBracket ? 'Bracket successfully updated.' : 'Bracket payload successfully saved.');
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Unable to submit bracket.');
    }
  }

  return (
    <div className="space-y-4">
      
      {!isReadOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Pick winners through Match 104. Later rounds unlock as winners advance.
          </p>
          <button
            disabled={!store.isBracketComplete() || submitStatus === 'submitting'}
            onClick={submitBracket}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              store.isBracketComplete() && submitStatus !== 'submitting'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'cursor-not-allowed bg-gray-100 text-gray-400',
            )}
          >
            <Send className="h-4 w-4" />
            {submitStatus === 'submitting'
              ? store.hasSavedBracket ? 'Updating...' : 'Submitting...'
              : store.hasSavedBracket ? 'Update bracket' : 'Submit bracket'}
          </button>
        </div>
      )}

      {championTeam && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Trophy className="h-4 w-4 flex-shrink-0" />
          <span className="font-semibold">{championTeam.flag} {championTeam.name}</span>
          <span>selected as champion</span>
        </div>
      )}

      <div className={cn("overflow-x-auto pb-4", !isReadOnly && "-mx-6 px-6")}>
        <div
          className="relative"
          style={{
            width: (CARD_WIDTH * ROUND_ORDER.length) + (CONNECTOR_WIDTH * (ROUND_ORDER.length - 1)),
            height: (MATCH_HEIGHT * 16) + (BASE_GAP * 15) + HEADER_HEIGHT,
          }}
        >
          {ROUND_ORDER.slice(0, -1).map((round, roundIndex) => (
            <ConnectorLines
              key={round}
              roundIndex={roundIndex}
              matchCount={matchesByRound[round].length}
              columnLeft={roundIndex * (CARD_WIDTH + CONNECTOR_WIDTH)}
            />
          ))}

          {ROUND_ORDER.map((round, roundIndex) => {
            const matches = matchesByRound[round];
            const columnLeft = roundIndex * (CARD_WIDTH + CONNECTOR_WIDTH);

            return (
              <section
                key={round}
                className="absolute top-0"
                style={{ left: columnLeft, width: CARD_WIDTH }}
              >
                <div className="text-center" style={{ width: CARD_WIDTH, height: HEADER_HEIGHT }}>
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {ROUND_LABELS[round]}
                  </h2>
                  {ROUND_DATES[round] && (
                    <p className="text-[10px] font-medium text-gray-300">{ROUND_DATES[round]}</p>
                  )}
                </div>

                {matches.map((match, matchIndex) => {
                  const selectedWinner = activeKnockoutPicks[match.id];
                  const disabled = isReadOnly || !match.ready; 

                  return (
                    <div
                      key={match.id}
                      className={cn(
                        'absolute h-[86px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all',
                        match.ready ? 'border-gray-200' : 'border-gray-100 opacity-80',
                      )}
                      style={{
                        top: matchTop(roundIndex, matchIndex),
                        width: CARD_WIDTH,
                      }}
                    >
                      <div className="flex h-7 items-center justify-between border-b border-gray-100 px-2">
                        <span className="text-[11px] font-semibold text-gray-500">{match.label}</span>
                        {match.winner && (
                          <span className="text-[10px] font-semibold text-teal-500">
                            Picked
                          </span>
                        )}
                      </div>

                      <div>
                        <TeamButton
                          team={match.teamAResolved}
                          selected={selectedWinner === match.teamAResolved?.id}
                          disabled={disabled}
                          onClick={() => !isReadOnly && match.teamAResolved && store.setKnockoutWinner(match.id, match.teamAResolved.id)}
                        />
                        <TeamButton
                          team={match.teamBResolved}
                          selected={selectedWinner === match.teamBResolved?.id}
                          disabled={disabled}
                          onClick={() => !isReadOnly && match.teamBResolved && store.setKnockoutWinner(match.id, match.teamBResolved.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>
      
      {!isReadOnly && submitMessage && (
        <p className={cn(
          'text-sm font-medium',
          submitStatus === 'success' ? 'text-teal-600' : 'text-red-600',
        )}>
          {submitMessage}
        </p>
      )}
    </div>
  );
}