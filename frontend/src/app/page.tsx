'use client';

import { useEffect, useState } from 'react';
import BracketForm from '@/src/components/BracketForm';
import GroupStageForm from '@/src/components/GroupStageForm';
import PredictorTabs from '@/src/components/PredictorTabs';
import ThirdPlaceForm from '@/src/components/ThirdPlaceForm';
import LoginForm from '@/src/components/LoginForm'; // Import the new form
import { usePredictorStore } from '@/src/store/predictorStore';

export default function PredictorPage() {
  const { activeTab, reset } = usePredictorStore();
  
  // Auth state
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    void usePredictorStore.persist.rehydrate();
    
    // Check if the user is already logged in on mount
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLoginSuccess = (user: string) => {
    setUsername(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUsername(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 relative">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Bracket</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              WC 2026 · Pick qualifiers and your path to the final
            </p>
          </div>
          
          {/* Top Right Controls: Auth & Reset */}
          <div className="flex flex-col items-end gap-2 mt-1">
            {username ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Hi, {username}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-1.5 px-4 rounded transition-colors"
              >
                Login
              </button>
            )}
            
            <button
              onClick={reset}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
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

      {/* Conditional Login Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <LoginForm 
            onSuccess={handleLoginSuccess} 
            onCancel={() => setShowLogin(false)} 
          />
        </div>
      )}
    </main>
  );
}