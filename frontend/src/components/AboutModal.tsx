'use client';

import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
          {/* CHANGED: text-xl on mobile, text-2xl on desktop */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">About WC26 Predictor</h2>
        </div>

        {/* Body content */}
        {/* CHANGED: text-xs on mobile, text-base on desktop */}
        <div className="space-y-4 text-gray-600 text-xs md:text-base">
          <p>
            I had a problem: my friends all have horrible ball knowledge, but they refuse to admit it. 
            <br /><br />
            Hence, I created the WC26 Predictor, to remind everyone of their shortcomings during the World Cup.
            <br /><br />
            If you can't put your money where your mouth is, at least put your predictions here, so you can still flex on your friends.
          </p>
          
          <h3 className="font-semibold text-gray-900 mt-6 md:text-lg">How it works:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Predict the top 2 teams from every group.</li>
            <li>Select your 3rd-place wildcards to advance.</li>
            <li>Plot your knockout stages all the way to the final.</li>
            <li>Join custom rooms to compete on a private leaderboard.</li>
            <li>Win against your friends.</li>
          </ul>


        <h3 className="font-semibold text-gray-900 mt-6 md:text-lg">Upcoming Features:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Group stage scoring</li>
            <li>Knockouts score prediction</li>
            <li>Fantasy Team</li>
          </ul>


          <p className="pt-4 text-[10px] md:text-xs text-gray-400">
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
          {/* CHANGED: text-sm on mobile, text-base on desktop */}
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 text-xs md:text-base font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
        
      </div>
    </div>
  );
}