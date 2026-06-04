'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Trophy, Users, LogIn, LogOut, Menu, X, Info } from 'lucide-react';
import { logoutUser, updateUsername } from '@/src/app/api/api';
import AboutModal from './AboutModal'; // Adjust path as needed

export default function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [username, setUsername] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  
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

  const handleUsernameClick = () => {
    setUsernameDraft(username ?? '');
    setUsernameError(null);
    setShowUsernameModal(true);
    setMobileMenuOpen(false);
  };

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextUsername = usernameDraft.trim();
    if (nextUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    if (nextUsername.length > 30) {
      setUsernameError('Username must be 30 characters or fewer.');
      return;
    }

    setIsUpdatingUsername(true);
    setUsernameError(null);

    try {
      const data = await updateUsername(nextUsername);
      setUsername(data.username);
      setShowUsernameModal(false);
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'Failed to update username.');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const isAuthenticated = username !== null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

          {/* Left: Logo + Desktop Nav */}

          <div className="flex items-center gap-8">
            
            {/* LOGO & MOBILE PROMPT WRAPPER */}
            <div className="flex flex-col justify-center">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="h-5 w-5 text-green-600" />
                <span className="uppercase tracking-tight">WC26 Predictor</span>
              </Link>

              {/* ✨ AESTHETIC PROMPT (MOBILE ONLY - UNDER LOGO) ✨ */}
              {!isAuthenticated && (
                <button 
                  onClick={onLoginClick}
                  // Changed ml-7 and text-left -> justify-center and w-full
                  className="flex sm:hidden items-center justify-center w-full gap-1.5 mt-0.5 animate-in fade-in duration-700 group"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-green-600 transition-colors">
                    Sign in to save brackets
                  </span>
                </button>
              )}
            </div>

            {/* Desktop nav — hidden on mobile */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:font-bold hover:text-gray-900 transition-colors"
              >
                Current Bracket
              </Link>
              <Link
                href="/fantasy"
                className="text-sm font-medium text-gray-600 hover:font-bold hover:text-gray-900 transition-colors"
              >
                Fantasy
              </Link>
              
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
                  <button
                    onClick={handleUsernameClick}
                    className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full transition-colors hover:bg-gray-200 hover:text-gray-900"
                  >
                    {username}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* ✨ AESTHETIC PROMPT (DESKTOP) ✨ */}
                  <div className="hidden lg:flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-4 duration-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                      Sign in to save brackets
                    </span>
                  </div>

                  <button
                    onClick={onLoginClick}
                    className="flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-green-500 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                </>
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
            <Link
              href="/fantasy"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fantasy
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
                  <button
                    onClick={handleUsernameClick}
                    className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full transition-colors hover:bg-gray-200 hover:text-gray-900"
                  >
                    {username}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* ✨ AESTHETIC PROMPT (MOBILE) ✨ */}
                  <p className="text-xs text-center font-medium text-gray-400 uppercase tracking-widest">
                    Unlock rooms & leaderboards
                  </p>
                  <button
                    onClick={handleLoginClick}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-500"
                  >
                    <LogIn className="h-4 w-4" />
                    Login to your account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />

      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleUsernameSubmit}
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Change Username</h2>
              <button
                type="button"
                onClick={() => setShowUsernameModal(false)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close change username dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-gray-700">
              Username
              <input
                value={usernameDraft}
                onChange={(event) => setUsernameDraft(event.target.value)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                maxLength={30}
                autoFocus
              />
            </label>

            {usernameError && (
              <p className="mt-3 text-sm font-medium text-red-500">{usernameError}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUsernameModal(false)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingUsername}
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isUpdatingUsername ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
