'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { joinRoom } from '@/src/app/api/api';

export default function JoinRoomPage() {
  return (
    <Suspense fallback={null}>
      <JoinRoomContent />
    </Suspense>
  );
}

function JoinRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  const [status, setStatus] = useState('Checking invitation...');

  useEffect(() => {
    const processInvite = async () => {
      if (!roomId) {
        setStatus('Invalid invitation link.');
        return;
      }

      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('access_token');

      if (!userId || !token) {
        setStatus('Please log in to join. Redirecting...');
        const redirectTo = encodeURIComponent(`/rooms/join?roomId=${roomId}`);
        router.push(`/?showLogin=true&redirectTo=${redirectTo}`);
        return;
      }

      setStatus('Joining room...');
      try {
        await joinRoom(roomId, userId);
        setStatus('Successfully joined! Taking you to the room...');
        setTimeout(() => router.push('/rooms'), 1000);
      } catch (error: any) {
        console.error('Error joining room:', error);

        const errorMessage = error?.message?.toLowerCase() || '';

        if (errorMessage.includes('already') || errorMessage.includes('duplicate') || errorMessage.includes('unique constraint')) {
          setStatus('You are already in this room! Redirecting...');
          setTimeout(() => router.push('/rooms'), 1500);
        } else {
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
