'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Navbar from '@/src/components/Navbar';
import LoginForm from '@/src/components/LoginForm';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900">
      {/* 1. The Global Navbar */}
      <Suspense fallback={null}>
        <Navbar onLoginClick={() => setShowLogin(true)} />
      </Suspense>
      
      {/* 2. The Page Content (this swaps between PredictorPage and RoomsPage) */}
      <main>
        {children}
      </main>

      {/* 3. The Global Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Suspense fallback={null}>
            <LoginForm 
              onSuccess={() => {
                setShowLogin(false);
              }} 
              onCancel={() => setShowLogin(false)} 
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
