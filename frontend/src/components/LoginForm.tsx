// src/components/LoginForm.tsx
import { useState } from 'react';
import { loginUser, signupUser } from '@/src/app/api/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  onSuccess: (username: string) => void;
  onCancel: () => void;
}

export default function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isLoginMode) {
        await signupUser(username, password);
      }

      const data = await loginUser(username, password);

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('username', data.user);
      localStorage.setItem('user_id', data.user_id);
      window.dispatchEvent(new Event('auth-change'));
      
      onSuccess(data.user);

      const redirectTo = searchParams.get('redirectTo');

      if (redirectTo) {
        router.push(redirectTo); 
      } else {
        router.push('/'); 
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Changed to translucent white background with backdrop blur and dark text */
    <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/40 rounded-md p-6 text-black shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center tracking-wide uppercase">
        {isLoginMode ? 'Login' : 'Create Account'}
      </h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-700 p-3 rounded mb-4 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* Made label text a clean dark gray */}
          <label className="block text-sm mb-1 text-slate-700 font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            /* Translucent input backgrounds that blend with the card layout */
            className="w-full bg-black/5 border border-black/10 rounded p-3 text-black focus:bg-white focus:border-green-600 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-slate-700 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black/5 border border-black/10 rounded p-3 text-black focus:bg-white focus:border-green-600 outline-none transition"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            /* Clean black outline button for cancel */
            className="flex-1 bg-red-400 border-black/20 hover:bg-red-500 text-white font-bold py-3 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition disabled:opacity-50 shadow-md"
          >
            {loading 
              ? 'Wait...' 
              : isLoginMode 
                ? 'Log In' 
                : 'Sign Up'}
          </button>
        </div>

        {/* The Toggle Link */}
        <div className="text-center mt-4 pt-2 border-t border-black/10">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null); 
            }}
            /* Darker green for text readability against a light background */
            className="text-sm font-semibold text-green-700 hover:text-green-800 transition uppercase tracking-wider"
          >
            {isLoginMode 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}