'use client';

import { useEffect } from 'react';
import BracketForm from '@/src/components/BracketForm';
import GroupStageForm from '@/src/components/GroupStageForm';
import PredictorTabs from '@/src/components/PredictorTabs';
import ThirdPlaceForm from '@/src/components/ThirdPlaceForm';
import { retrieveBracketPayload } from '@/src/app/api/api';
import { usePredictorStore } from '@/src/store/predictorStore';

export default function PredictorPage() {
  const { activeTab, reset, loadBracketData } = usePredictorStore();

  useEffect(() => {
    const loadUserBracket = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        loadBracketData(null);
        return;
      }

      try {
        const data = await retrieveBracketPayload();
        loadBracketData(data.bracket_data);
      } catch (error) {
        console.error('Failed to load saved bracket', error);
        loadBracketData(null);
      }
    };

    void loadUserBracket();
    window.addEventListener('auth-change', loadUserBracket);

    return () => window.removeEventListener('auth-change', loadUserBracket);
  }, [loadBracketData]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
      
      {/* Header Section */}
      <div className="flex items-start justify-between">        
        <div className="mt-1">
          <button
            onClick={reset}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Reset all
          </button>
        </div>
      </div>

      <PredictorTabs />

      {activeTab === 'groups' && <GroupStageForm />}
      {activeTab === 'third' && <ThirdPlaceForm />}
      {activeTab === 'bracket' && <BracketForm />}
    </div>
  );
}
