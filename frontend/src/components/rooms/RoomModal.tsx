import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { RoomModalProps } from '@/src/interfaces/Room';

export default function RoomModal({ room, onClose }: RoomModalProps) {
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  // The Invite Logic
  const handleInviteClick = () => {
    // Uses the room.id (UUID) to create the unique join link
    const inviteLink = `${window.location.origin}/rooms/${room.id}/join`;

    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset button after 2 seconds
    });
  };

  // Dummy data to map over until your backend endpoint is ready
  const dummyParticipants = [
    { id: 101, username: "minhao", pick: "Spain", flag: "🇪🇸", score: "TBC" },
    { id: 102, username: "john_doe", pick: "Brazil", flag: "🇧🇷", score: "TBC" },
    { id: 103, username: "sarah99", pick: "Germany", flag: "🇩🇪", score: "TBC" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blurred backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />
      
      {/* Modal Content Box */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Section (Title + Invite + Close) */}
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

        {/* Participants List */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {dummyParticipants.map((user, index) => (
            <div 
              key={user.id} 
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:bg-slate-50 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-400 w-6 text-right">{index + 1}</span>
                <span className="font-medium text-gray-900">{user.username}</span>
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                  <span className="hidden md:inline">{user.pick}</span> 
                  <span className="text-xl">{user.flag}</span>
                </span>
                <span className="font-mono bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                  {user.score}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}