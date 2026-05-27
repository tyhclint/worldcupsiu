import { useState } from 'react';

export default function LeaderboardHeader({ roomId, roomName } : { roomId: string, roomName: string }) {
  const [copied, setCopied] = useState(false);

  const handleInviteClick = () => {
    const inviteLink = `${window.location.origin}/rooms/${roomId}/join`;

    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    });
  };

  return (
    <div className="flex justify-between items-center w-full mb-4">
      <h2 className="text-xl font-bold">{roomName} Leaderboard</h2>
      
      <div className="flex gap-2">
        <button 
          onClick={handleInviteClick}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          {copied ? 'Copied!' : 'Invite Friends'}
        </button>
      </div>
    </div>
  );
}