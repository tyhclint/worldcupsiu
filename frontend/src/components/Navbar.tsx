'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Trophy, Users, LogIn, LogOut, Menu, X, Info } from 'lucide-react';
import { logoutUser } from '@/src/app/api/api';
import AboutModal from './AboutModal'; // Adjust path as needed

export default function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [username, setUsername] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // NEW: State to control the About modal
  const [showAboutModal, setShowAboutModal] = useState(false);
  
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

  useEffect(() => {
    if (searchParams.get('showLogin') === 'true' && !username) {
      onLoginClick();
    }
  }, [searchParams, username, onLoginClick]);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.dispatchEvent(new Event('auth-change'));
    setMobileMenuOpen(false);
    if (window.location.pathname === '/rooms') {
      window.location.href = '/';
    }
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    onLoginClick();
  };

  const handleAboutClick = () => {
    setMobileMenuOpen(false);
    setShowAboutModal(true);
  };

  const isAuthenticated = username !== null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="uppercase tracking-tight">WC26 Predictor</span>
            </Link>

            {/* Desktop nav — hidden on mobile */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:font-bold hover:text-gray-900 transition-colors"
              >
                Current Bracket
              </Link>
              
              {/* NEW: About Button (Desktop) */}
              <button
                onClick={() => setShowAboutModal(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:font-bold hover:text-gray-900 transition-colors"
              >
                <Info className="h-4 w-4" />
                About
              </button>

              {isAuthenticated && (
                <Link
                  href="/rooms"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:font-bold hover:text-gray-900 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  My Rooms
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Desktop auth + Mobile hamburger */}
          <div className="flex items-center gap-4">
            {/* Desktop auth — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-4">
              {isAuthenticated ? (
                <>
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
                </>
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

            {/* Mobile hamburger — hidden on desktop */}
            <button
              className="sm:hidden flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white px-6 py-4 flex flex-col gap-4 shadow-lg absolute w-full">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Current Bracket
            </Link>

            {/* NEW: About Button (Mobile) */}
            <button
              onClick={handleAboutClick}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors text-left"
            >
              <Info className="h-4 w-4" />
              About
            </button>

            {isAuthenticated && (
              <Link
                href="/rooms"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                My Rooms
              </Link>
            )}

            <div className="border-t border-gray-100 pt-4 mt-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
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
                  onClick={handleLoginClick}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-500"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
    </>
  );
}