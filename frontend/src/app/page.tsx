'use client';

import { usePredictorStore } from '@/src/store/predictorStore';
import PredictorTabs from '@/src/components/PredictorTabs';
import GroupStageForm from '@/src/components/GroupStageForm';

export default function PredictorPage() {
  const { activeTab, reset } = usePredictorStore();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
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

        {/* Tabs */}
        <PredictorTabs />

        {/* Panels */}
        {activeTab === 'groups' && <GroupStageForm />}

        {activeTab === 'third' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-400">
            ThirdPlaceForm coming soon
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-400">
            BracketForm coming soon
          </div>
        )}

      </div>
    </main>
  );
}