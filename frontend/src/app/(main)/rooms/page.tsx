'use client';

import { useState } from 'react';
import { Plus, Flag } from 'lucide-react';
import { cn } from '@/src/utils/merge';

// Temporary Mock Data
const MOCK_ROOMS = [
  {
    id: '1',
    name: 'room 1',
    leaderboard: ['Player A', 'Player B', 'Player C'],
  },
  {
    id: '2',
    name: 'Office Pool',
    leaderboard: ['Dave', 'Sarah', 'Mike'],
  },
  {
    id: '3',
    name: 'Family Bracket',
    leaderboard: ['Mom', 'Dad', 'Jimmy'],
  },
];

export default function RoomsPage() {

  const [rooms, setRooms] = useState<typeof MOCK_ROOMS>([]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      
      {/* DEV HELPER: Remove this button later. Just here so you can test both states! */}
      <div className="mb-8 flex justify-end">
        <button 
          onClick={() => setRooms(rooms.length ? [] : MOCK_ROOMS)}
          className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md font-semibold hover:bg-indigo-200 transition"
        >
          Toggle Empty/Populated State
        </button>
      </div>

      {rooms.length === 0 ? (

        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
          <p className="text-gray-500 font-medium tracking-wide">
            you may be offside...
          </p>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-sm">
            <Plus className="h-4 w-4" />
            create a room
          </button>
        </div>
      ) : (

        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Rooms</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-sm">
              <Plus className="h-4 w-4" />
              New Room
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div 
                key={room.id} 
                className="group relative flex flex-col items-center justify-center aspect-square bg-[#9CA3AF] rounded-[2.5rem] p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              >
                {/* Room Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-black transition-colors">
                  {room.name}
                </h2>

                {/* Leaderboard List */}
                <div className="flex flex-col gap-2 text-sm font-medium text-gray-800">
                  {room.leaderboard.map((player, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <span className="opacity-70">ranked {index + 1}:</span>
                      <span>{player}</span>
                    </div>
                  ))}
                  
                  <span className="text-gray-700 tracking-[0.2em] mt-2 font-bold">....</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}