'use client';

import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />
      
      {/* Modal Content - CHANGED: max-w-sm, max-h-[75vh], p-4 */}
      <div className="relative bg-white w-full max-w-sm max-h-[75vh] rounded-2xl shadow-2xl p-4 md:p-6 z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2 shrink-0">
          <h2 className="text-base md:text-lg font-bold text-gray-900 uppercase">About WC26 Predictor</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body content - CHANGED: text-[10px] on mobile, space-y-3 */}
        <div className="space-y-3 text-gray-600 text-[10px] md:text-xs leading-relaxed overflow-y-auto pr-1 uppercase">
          
          <div className="space-y-1.5">
            <p>I had a problem: my friends all have horrible ball knowledge, but they refuse to admit it.</p>
            <p>Hence, I created the WC26 Predictor, to remind everyone of their shortcomings during the World Cup.</p>
            <p>If you can't put your money where your mouth is, at least put your predictions here, so you can still flex on your friends.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How it works:</h3>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Predict the top 2 teams from every group.</li>
              <li>Select your 3rd-place wildcards to advance.</li>
              <li>Plot your knockout stages all the way to the final.</li>
              <li>Join custom rooms to compete on a private leaderboard.</li>
              <li>Win against your friends.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Upcoming Features:</h3>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Group stage scoring</li>
              <li>Knockouts score prediction</li>
              <li>Fantasy team</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 text-gray-700 text-[10px] md:text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors uppercase"
          >
            Close
          </button>
        </div>
        
      </div>
    </div>
  );
}