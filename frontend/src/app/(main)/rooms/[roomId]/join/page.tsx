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
      // 🟠 2. Check what the ID is BEFORE the early return
      console.log('🟠 EFFECT: processInvite triggered. roomId is:', roomId);

      if (!roomId) {
        console.log('🟡 EXIT: roomId is missing or undefined. Stopping here.');
        return;
      }

      // 3. Just check localStorage! No Supabase needed.
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('access_token');

      // 🟢 4. Check credentials safely
      console.log('🟢 CREDENTIALS:');
      console.log('   - User ID:', userId);
      console.log('   - Access Token:', token ? '[EXISTS]' : '[MISSING]');

      // If either is missing, they aren't fully logged in
      if (!userId || !token) {
        console.log('🔵 REDIRECT: Missing credentials. Sending to /login.');
        setStatus('Please log in to join. Redirecting...');
        router.push(`/login?redirectTo=/rooms/${roomId}/join`);
        return;
      }

      // 2. Proceed with API logic
      setStatus('Joining room...');
      try {
        console.log('🟣 API: Calling joinRoom...');
        await joinRoom(roomId, userId); 
        console.log('✅ API: Success!');
        
        setStatus('Successfully joined! Taking you to the room...');
        setTimeout(() => router.push('/rooms'), 1000);

      } catch (error: any) {
        console.error('❌ API ERROR: Fetch failed!', error);
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('already') || errorMessage.includes('duplicate') || errorMessage.includes('unique constraint')) {
          console.log('⚠️ API INFO: User is already in the room.');
          setStatus('You are already in this room! Redirecting...');
          setTimeout(() => router.push('/rooms'), 1500);
        } else {
          console.log('🚨 API INFO: Unhandled error message:', errorMessage);
          setStatus(`Oops! Failed to join: ${error.message}`);
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