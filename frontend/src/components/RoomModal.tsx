import { X } from 'lucide-react';

interface RoomModalProps {
  room: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
}

export default function RoomModal({ room, onClose }: RoomModalProps) {
  if (!room) return null;

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
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {room.name} Leaderboard
        </h2>

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