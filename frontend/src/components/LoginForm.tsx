// src/components/LoginForm.tsx
import { useState } from 'react';
import { loginUser, signupUser } from '@/src/app/api/api';

interface LoginFormProps {
  onSuccess: (username: string) => void;
  onCancel: () => void;
}

export default function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
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

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-black border border-white/20 rounded-md p-6 text-white shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLoginMode ? 'Login' : 'Create Account'}
      </h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-400">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full bg-black border border-white/20 rounded p-3 focus:border-green-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black border border-white/20 rounded p-3 focus:border-green-500 outline-none transition"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-bold py-3 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition disabled:opacity-50"
          >
            {loading 
              ? 'Wait...' 
              : isLoginMode 
                ? 'Log In' 
                : 'Sign Up'}
          </button>
        </div>

        {/* The Toggle Link */}
        <div className="text-center mt-4 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null); 
            }}
            className="text-sm text-green-500 hover:text-green-400 transition"
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
