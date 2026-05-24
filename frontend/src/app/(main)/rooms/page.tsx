'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getUserRooms, createRoom } from '@/src/app/api/api';

// 1. Define the actual shape of the data coming from your backend
interface Room {
  id: string;
  name: string;
  created_at: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Fetch rooms on component mount
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Grab the user_id from localStorage (matching your current setup)
      const userId = localStorage.getItem('username'); 
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const data = await getUserRooms(userId);
      setRooms(data.rooms || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 3. Handle Creating a New Room
  const handleCreateRoom = async () => {
    // Using a quick browser prompt for testing. You can upgrade this to a nice Modal later!
    const roomName = window.prompt('Enter a name for your new room:');
    if (!roomName) return;

    const userId = localStorage.getItem('username');
    if (!userId) {
      alert('You must be logged in to create a room.');
      return;
    }

    try {
      await createRoom(roomName, userId);
      fetchRooms(); // Refresh the list so the new room appears instantly
    } catch (err: any) {
      alert(`Error creating room: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 text-red-500">
        <p>Something went wrong: {error}</p>
        <button onClick={fetchRooms} className="underline hover:text-red-700">Try again</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {rooms.length === 0 ? (
        /* =========================================
           EMPTY STATE
           ========================================= */
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
          <p className="text-gray-500 font-medium tracking-wide">
            you may be offside...
          </p>
          <button 
            onClick={handleCreateRoom}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            create a room
          </button>
        </div>
      ) : (
        /* =========================================
           POPULATED STATE
           ========================================= */
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Rooms</h1>
            <button 
              onClick={handleCreateRoom}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-sm"
            >
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

                {/* Leaderboard Placeholder */}
                <div className="flex flex-col gap-2 text-sm font-medium text-gray-800">
                  <div className="flex items-center justify-center gap-2 text-gray-700 italic text-xs">
                    Leaderboard data coming soon...
                  </div>
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