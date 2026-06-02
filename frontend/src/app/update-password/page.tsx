'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePassword, logoutUser } from '@/src/app/api/api';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // 1. Grab the hash from the URL (e.g., #access_token=123&refresh_token=456)
    const hash = window.location.hash;
    
    if (hash) {
      // 2. Parse the parameters out of the hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      // 3. Save them to localStorage so fetchWithAuth can use them!
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
      }
      
      // Optional: Clean up the URL so the user doesn't see the massive token
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updatePassword(password);

      setIsSuccess(true);
      setLoading(false);


      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        window.dispatchEvent(new Event('auth-change'));
        
        router.push('/');
      }, 3500); 

    } catch (err) {
      setLoading(false);
      setError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {isSuccess && (
        <div className="mb-4 p-4 text-center bg-green-100 border border-green-400 text-green-700 rounded-lg animate-pulse">
          Password successfully reset! Redirecting...
        </div>
      )}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/40 rounded-md p-6 text-black shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center tracking-wide uppercase">
          Set New Password
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-700 p-3 rounded mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-black/5 border border-black/10 rounded p-3 text-black focus:bg-white focus:border-green-600 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition disabled:opacity-50 shadow-md"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}