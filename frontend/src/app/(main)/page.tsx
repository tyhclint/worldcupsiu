'use client';

import { useEffect } from 'react';
import BracketForm from '@/src/components/BracketForm';
import GroupStageForm from '@/src/components/GroupStageForm';
import PredictorTabs from '@/src/components/PredictorTabs';
import ThirdPlaceForm from '@/src/components/ThirdPlaceForm';
import { usePredictorStore } from '@/src/store/predictorStore';

export default function PredictorPage() {
  const { activeTab, reset } = usePredictorStore();

  useEffect(() => {
    // Only keeping the store rehydration
    void usePredictorStore.persist.rehydrate();
  }, []);

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