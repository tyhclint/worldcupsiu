'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// 1. Import useSearchParams
import { useSearchParams } from 'next/navigation'; 
import { Trophy, Users, LogIn, LogOut } from 'lucide-react';
import { logoutUser } from '@/src/app/api/api';
import { cn } from '@/src/utils/merge';

export default function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [username, setUsername] = useState<string | null>(null);
  // 2. Initialize searchParams
  const searchParams = useSearchParams(); 

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    const handleAuthChange = () => {
      setUsername(localStorage.getItem('username'));
    };

    handleAuthChange();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // 3. Add this new useEffect right here!
  useEffect(() => {
    // If the URL has ?showLogin=true AND the user isn't already logged in...
    if (searchParams.get('showLogin') === 'true' && !username) {
      onLoginClick(); // Automatically pop the modal open!
    }
  }, [searchParams, username, onLoginClick]);

  const handleLogout = () => {
    logoutUser();
    
    window.dispatchEvent(new Event('auth-change'));
    
    if (window.location.pathname === '/rooms') {
      window.location.href = '/';
    }
  };

  const isAuthenticated = username !== null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <Trophy className="h-5 w-5 text-green-600" />
            <span>WC26 Predictor</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Current Bracket
            </Link>

            {isAuthenticated && (
              <Link 
                href="/rooms" 
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Users className="h-4 w-4" />
                My Rooms
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-500"
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
          )}
        </div>
        
      </div>
    </header>
  );
}