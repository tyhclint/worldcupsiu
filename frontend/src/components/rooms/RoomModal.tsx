import { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { RoomModalProps } from '@/src/interfaces/Room';
import { getRoomMembers } from '@/src/app/api/api';

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
  const renderReadOnlyBracket = () => {
    if (!selectedUser?.bracket_data) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 h-full">
          <p className="text-lg">No bracket data available for {selectedUser?.username}.</p>
          <button onClick={() => setSelectedUser(null)} className="mt-4 text-indigo-600 hover:underline">
            Go Back to Leaderboard
          </button>
        </div>
      );
    }

    // Pass the raw DB JSON through your adapter!
    const formattedData = transformDbBracketToState(selectedUser.bracket_data);

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
           <div>
             <h4 className="text-lg font-bold mb-4 text-gray-800">Group Stage Picks</h4>
             <GroupStageForm readOnlyData={formattedData} />
           </div>
           
           <div>
             <h4 className="text-lg font-bold mb-4 text-gray-800">Knockout Stage Picks</h4>
             <BracketForm readOnlyData={formattedData} />
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />
      
      {/* 🆕 Dynamic width & height! 
        If a user is selected, expand to max-w-6xl so the bracket fits. 
        Otherwise, stay at max-w-2xl for the leaderboard. 
      */}
      <div className={`relative bg-white w-full rounded-2xl shadow-2xl p-6 md:p-8 z-10 flex flex-col transition-all duration-300 ${
        selectedUser ? 'max-w-7xl h-[90vh]' : 'max-w-2xl'
      }`}>
        
        {/* 🆕 THE TOGGLE: Are we viewing the list, or a specific user? */}
        {!selectedUser ? (
          <>
            {/* --- START OF LEADERBOARD VIEW --- */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {room.name} Leaderboard
              </h2>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleInviteClick}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Link Copied!' : 'Invite Friends'}
                </button>

                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500 bg-red-50 rounded-xl border border-red-100">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
                {participants.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">It's quiet here. Invite some friends!</p>
                ) : (
                  participants.map((user, index) => {
                    const winner = getPredictedWinner(user.bracket_data);
                    
                    return (
                      <div 
                        key={user.user_id} 
                        onClick={() => setSelectedUser(user)}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-400 w-6 text-right">{index + 1}</span>
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 md:gap-6">
                          <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                            <span className="hidden md:inline">{winner.name}</span> 
                            {winner.teamId ? (
                              <FlagIcon teamId={winner.teamId} label={winner.name} className="text-xl" />
                            ) : (
                              <span className="text-xl">{winner.flag}</span>
                            )}
                          </span>
                          <span className="font-mono bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                            {user.score} pts
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
            {/* --- END OF LEADERBOARD VIEW --- */}
          </>
        ) : (
          /* --- START OF BRACKET VIEW --- */
          renderReadOnlyBracket()
        )}
      </div>
    </div>
  );
}
