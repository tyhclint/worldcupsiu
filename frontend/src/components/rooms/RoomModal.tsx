import { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { RoomModalProps } from '@/src/interfaces/Room';
import { getRoomMembers, type FantasySelectedPlayer, type FantasySquadPayload } from '@/src/app/api/api';

import GroupStageForm from '@/src/components/GroupStageForm';
import BracketForm from '@/src/components/BracketForm';
import FlagIcon from '@/src/components/FlagIcon';
import { transformDbBracketToState } from '@/src/lib/bracket';
import { getTeamById } from '@/src/lib/db';

export default function RoomModal({ room, onClose }: RoomModalProps) {
  const [copied, setCopied] = useState(false);
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tracks who was clicked
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    if (!room) return;

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRoomMembers(room.id);
        setParticipants(data.members); 
      } catch (err: any) {
        setError(err.message || "Failed to load participants");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [room]);

  if (!room) return null;

  const handleInviteClick = () => {
    const inviteLink = `${window.location.origin}/rooms/join?roomId=${encodeURIComponent(room.id)}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getPredictedWinner = (bracketData: any) => {
    // 1. If they haven't saved a bracket at all
    if (!bracketData) return { name: "No bracket yet", flag: "⏱️" };
    
    // 2. Grab the ID of the team they picked to win the final (Match 104)
    const championId = bracketData?.knockouts?.M104;
    
    if (championId) {
      // 3. Look up the real team data!
      const championTeam = getTeamById(championId);
      
      return { 
        name: championTeam ? "Predicted:  " + championTeam.name : "Predicted", 
        flag: championTeam ? championTeam.flag : "🏆",
        teamId: championTeam?.id,
      };
    }

    return { name: "TBC", flag: "❓" };
  };

  // 🆕 The Helper to render the forms
  const fantasyPositionLabel = {
    Goalkeeper: 'GKP',
    Defender: 'DEF',
    Midfielder: 'MID',
    Attacker: 'FWD',
  } as const;

  const getFantasyPlayersBySlotPrefix = (
    players: Record<string, FantasySelectedPlayer>,
    prefix: string,
  ) => Object.entries(players)
    .filter(([slotId]) => slotId.startsWith(prefix))
    .sort(([slotA], [slotB]) => slotA.localeCompare(slotB))
    .map(([, player]) => player);

  const renderFantasySlot = (player: FantasySelectedPlayer) => (
    <div
      key={`${player.id}-${player.country_code}`}
      className="flex h-28 w-24 flex-col items-center justify-center overflow-hidden rounded-lg border border-white/30 bg-white/15 text-white shadow-sm"
    >
      <img
        src={player.photo}
        alt={player.name}
        className="h-14 w-14 rounded-full object-cover"
      />
      <span className="mt-1 max-w-full truncate px-1 text-xs font-bold">{player.name}</span>
      <span className="text-[10px] uppercase text-white/70">
        {fantasyPositionLabel[player.position]}
      </span>
    </div>
  );

  const renderFantasyPitch = (fantasySquad: FantasySquadPayload) => {
    const starters = fantasySquad.starters ?? {};
    const bench = fantasySquad.bench ?? {};
    const rows = [
      getFantasyPlayersBySlotPrefix(starters, 'starter-gkp'),
      getFantasyPlayersBySlotPrefix(starters, 'starter-def'),
      getFantasyPlayersBySlotPrefix(starters, 'starter-mid'),
      getFantasyPlayersBySlotPrefix(starters, 'starter-fwd'),
    ];

    return (
      <div className="rounded-xl bg-green-700 p-4 shadow-sm">
        <div className="space-y-8 rounded-lg border-2 border-white/70 bg-green-600 px-4 py-8">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-6">
              {row.map((player) => renderFantasySlot(player))}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-white/20 p-4">
          <p className="mb-3 text-center text-sm font-bold uppercase text-white">Substitutes</p>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(bench)
              .sort(([slotA], [slotB]) => slotA.localeCompare(slotB))
              .map(([, player]) => renderFantasySlot(player as FantasySelectedPlayer))}
          </div>
        </div>
      </div>
    );
  };

  const renderReadOnlyBracket = () => {
    // Pass the raw DB JSON through your adapter!
    const formattedData = selectedUser?.bracket_data
      ? transformDbBracketToState(selectedUser.bracket_data)
      : null;

    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6 border-b pb-4 shrink-0">
          <button 
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center text-gray-600"
          >
             <ArrowLeft className="h-5 w-5 mr-1"/> Back
          </button>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedUser.username}'s Bracket
          </h3>
        </div>

        {/* The scrolling container for the forms */}
        <div className="overflow-y-auto overflow-x-auto pr-2 flex-grow space-y-12 pb-12">
           {formattedData ? (
             <>
               <div>
                 <h4 className="text-lg font-bold mb-4 text-gray-800">Group Stage Picks</h4>
                 <GroupStageForm readOnlyData={formattedData} />
               </div>
               
               <div>
                 <h4 className="text-lg font-bold mb-4 text-gray-800">Knockout Stage Picks</h4>
                 <BracketForm readOnlyData={formattedData} />
               </div>
             </>
           ) : (
             <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-500">
               No bracket data available for {selectedUser?.username}.
             </div>
           )}

           <div>
             <h4 className="text-lg font-bold mb-4 text-gray-800">Fantasy Squad</h4>
             {selectedUser.fantasy_squad ? (
               renderFantasyPitch(selectedUser.fantasy_squad)
             ) : (
               <p className="text-sm text-gray-500">No fantasy squad available.</p>
             )}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className={`relative bg-white w-full rounded-2xl shadow-2xl p-4 md:p-8 z-10 flex flex-col transition-all duration-300 ${
        selectedUser ? 'max-w-7xl h-[95vh] md:h-[90vh]' : 'max-w-2xl max-h-[95vh]'
      }`}>
        
        {!selectedUser ? (
          <>
            {/* --- LEADERBOARD HEADER --- */}
            {/* Mobile: Stacked, Desktop: Side-by-side */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
              
              <div className="flex justify-between items-center w-full md:w-auto">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">
                  {room.name} Leaderboard
                </h2>
                
                {/* Mobile Close Button (Shows here on mobile, hides on desktop) */}
                <button 
                  onClick={onClose}
                  className="md:hidden p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={handleInviteClick}
                  className={`flex-1 md:flex-none flex justify-center items-center gap-2 text-sm px-4 py-2.5 rounded-lg font-semibold transition-all ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Link Copied!' : 'Invite Friends'}
                </button>

                {/* Desktop Close Button (Shows here on desktop, hides on mobile) */}
                <button 
                  onClick={onClose}
                  className="hidden md:flex p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* --- LOADING / ERROR STATES --- */}
            {loading && (
              <div className="flex justify-center items-center py-12 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center p-4 md:py-8 text-red-500 bg-red-50 rounded-xl border border-red-100 text-sm md:text-base">
                <p className="font-semibold uppercase tracking-wide">{error}</p>
              </div>
            )}

            {/* --- PARTICIPANT LIST --- */}
            {!loading && !error && (
              <div className="flex flex-col gap-2 md:gap-3 overflow-y-auto pr-1 pb-4">
                {participants.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm">It's quiet here. Invite some friends!</p>
                ) : (
                  participants.map((user, index) => {
                    const winner = getPredictedWinner(user.bracket_data);
                    
                    return (
                      <div 
                        key={user.user_id} 
                        onClick={() => setSelectedUser(user)}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-3 md:p-4 flex justify-between items-center hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer group w-full"
                      >
                        {/* LEFT SIDE: Rank & Name (and Prediction on Mobile) */}
                        <div className="flex items-start md:items-center gap-3">
                          <span className="font-bold text-gray-400 w-4 md:w-6 text-right mt-0.5 md:mt-0">
                            {index + 1}
                          </span>
                          
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm md:text-base truncate max-w-[120px] sm:max-w-[200px]">
                              {user.username}
                            </span>
                            
                            {/* Mobile Prediction (Shows under name) */}
                            <span className="md:hidden text-xs text-gray-500 flex items-center gap-1 mt-1">
                              {winner.teamId ? (
                                <FlagIcon teamId={winner.teamId} label={winner.name} className="text-sm" />
                              ) : (
                                <span>{winner.flag}</span>
                              )}
                              <span className="truncate max-w-[80px]">{winner.name}</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* RIGHT SIDE: Prediction (Desktop), Score, Arrow */}
                        <div className="flex items-center gap-3 md:gap-6 shrink-0">
                          
                          {/* Desktop Prediction (Hidden on mobile) */}
                          <span className="hidden md:flex text-gray-600 items-center gap-2 text-sm">
                            <span>{winner.name}</span> 
                            {winner.teamId ? (
                              <FlagIcon teamId={winner.teamId} label={winner.name} className="text-xl" />
                            ) : (
                              <span className="text-xl">{winner.flag}</span>
                            )}
                          </span>

                          {/* Score Badge */}
                          <span className="font-mono bg-white border border-gray-200 text-gray-700 px-2 py-1 md:px-3 md:py-1 rounded-md text-xs md:text-sm font-bold shadow-sm shrink-0">
                            {user.score} pts
                          </span>
                          
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0 hidden sm:block" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        ) : (
          renderReadOnlyBracket()
        )}
      </div>
    </div>
  );
}
