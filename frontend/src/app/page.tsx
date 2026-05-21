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
    void usePredictorStore.persist.rehydrate();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Bracket</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              WC 2026 · Pick qualifiers and your path to the final
            </p>
          </div>
          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
          >
            Reset all
          </button>
        </div>

        <PredictorTabs />

        {activeTab === 'groups' && <GroupStageForm />}
        {activeTab === 'third' && <ThirdPlaceForm />}
        {activeTab === 'bracket' && <BracketForm />}
      </div>
    </main>
  );
}
