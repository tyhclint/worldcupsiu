'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getUserRooms, createRoom } from '@/src/app/api/api';
import RoomModal from '@/src/components/rooms/RoomModal'; // Adjust path based on where you save it

// 1. Define the actual shape of the data
interface Room {
  id: string;
  name: string;
  created_at: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // NEW: State to track which room is open in the modal
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // 2. Fetch rooms on component mount
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('user_id'); 
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
    const roomName = window.prompt('Enter a name for your new room:');
    if (!roomName) return;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      toast.error('Unable to create room.', {
        description: 'You must be logged in to create a room.',
      });
      return;
    }

    try {
      await createRoom(roomName, userId);
      toast.success('Room created successfully.');
      fetchRooms(); 
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong while creating the room.';
      toast.error('Unable to create room.', {
        description: errorMessage,
      });
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
    <div className="max-w-6xl mx-auto px-6 py-8 relative">
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
            <h1 className="text-3xl font-bold text-gray-900">My Rooms</h1>
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
                onClick={() => setSelectedRoom(room)} // NEW: Triggers modal
                className="group relative flex flex-col items-center justify-center h-56 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-center transition-all hover:-translate-y-1 hover:shadow-md hover:bg-white cursor-pointer"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-black transition-colors">
                  {room.name}
                </h2>

                <div className="flex flex-col gap-1 text-sm font-medium text-gray-500">
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render the extracted modal Component */}
      <RoomModal 
        room={selectedRoom} 
        onClose={() => setSelectedRoom(null)} 
      />
    </div>
  );
}
