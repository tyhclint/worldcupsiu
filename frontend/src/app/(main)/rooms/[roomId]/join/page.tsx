'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { joinRoom } from '@/src/app/api/api'; 

export default function JoinRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  
  const [status, setStatus] = useState('Checking invitation...');

  // 🔴 1. Check if the component mounts and what params it sees
  console.log('🔴 RENDER: Component loaded. Raw params object:', params);

  useEffect(() => {
    const processInvite = async () => {
      if (!roomId) return;

      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('access_token');

      // 🔴 PATH A: Not logged in. Send to root with modal triggers.
      if (!userId || !token) {
        setStatus('Please log in to join. Redirecting...');
        router.push(`/?showLogin=true&redirectTo=/rooms/${roomId}/join`);         
        return;
      }

      // 🟢 PATH B: Logged in. Join the room directly.
      setStatus('Joining room...');
      try {
        await joinRoom(roomId, userId); 
        setStatus('Successfully joined! Taking you to the room...');
        setTimeout(() => router.push('/rooms'), 1000);
      } catch (error: any) {
        // 1. Log the actual error to the console!
        console.error("🚨 REAL ERROR FROM BACKEND:", error);

        const errorMessage = error?.message?.toLowerCase() || '';
        
        // 2. Only say "already in room" if the backend explicitly tells us that
        if (errorMessage.includes('already') || errorMessage.includes('duplicate') || errorMessage.includes('unique constraint')) {
          setStatus('You are already in this room! Redirecting...');
          setTimeout(() => router.push('/rooms'), 1500);
        } else {
          // 3. Otherwise, print the real error on the screen so we can read it
          setStatus(`Failed to join: ${error.message || 'Unknown server error'}`);
        }
      }
    };

    processInvite();
  }, [roomId, router]);

  return (
    <div className="flex h-[70vh] w-full items-center justify-center p-4">
      <div className="bg-black max-w-md w-full rounded-md border border-white/20 p-8 text-center text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-2xl font-bold mb-4">Room Invitation</h1>
        
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
        
        <p className="text-gray-400 font-medium">{status}</p>
      </div>
    </div>
  );
}