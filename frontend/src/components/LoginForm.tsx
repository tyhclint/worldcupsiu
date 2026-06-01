// src/components/LoginForm.tsx
import { useState } from 'react';
import { loginUser, signupUser, requestPasswordReset } from '@/src/app/api/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  onSuccess: (username: string) => void;
  onCancel: () => void;
}

export default function LoginForm({ onSuccess, onCancel }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  // passowrd reset 
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  
  // Added email state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        await requestPasswordReset(email);
        setSuccessMessage("If that email exists, a reset link has been sent!");
        setLoading(false);
        return; // Stop here so it doesn't try to log them in!
      }
      
      if (!isLoginMode) {
        // Updated to pass all 3 arguments
        await signupUser(email, username, password);
      }

      // Updated to log in using email instead of username
      const data = await loginUser(email, password);

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
    <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/40 rounded-md p-6 text-black shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center tracking-wide uppercase">
        {isForgotPassword ? 'Reset Password' : isLoginMode ? 'Login' : 'Create Account'}
      </h2>
      
      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-700 p-3 rounded mb-4 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* SUCCESS MESSAGE (For Password Reset) */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-700 p-3 rounded mb-4 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* EMAIL FIELD - Always shown in all 3 modes */}
        <div>
          <label className="block text-sm mb-1 text-slate-700 font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black/5 border border-black/10 rounded p-3 text-black focus:bg-white focus:border-green-600 outline-none transition"
          />
        </div>

        {/* USERNAME FIELD - ONLY shown during Signup */}
        {!isLoginMode && !isForgotPassword && (
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">Display Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-black/5 border border-black/10 rounded p-3 text-black focus:bg-white focus:border-green-600 outline-none transition"
            />
          </div>
        )}

        {/* PASSWORD FIELD - Hidden if they are resetting their password */}
        {!isForgotPassword && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-slate-700 font-medium">Password</label>
              
              {/* FORGOT PASSWORD BUTTON - Only shows on the Login screen */}
              {isLoginMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-green-700 hover:text-green-800 transition"
                >
                  Forgot password?
                </button>
              )}
            </div>
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/5 border border-black/10 rounded p-3 text-black focus:bg-white focus:border-green-600 outline-none transition"
            />
          </div>
        )}

        {/* SUBMIT BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
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
              : isForgotPassword
                ? 'Send Link'
                : isLoginMode 
                  ? 'Log In' 
                  : 'Sign Up'}
          </button>
        </div>

        {/* BOTTOM TOGGLE LINK */}
        <div className="text-center mt-4 pt-2 border-t border-black/10">
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-sm font-semibold text-green-700 hover:text-green-800 transition uppercase tracking-wider"
            >
              Back to Login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null); 
                if (isLoginMode) setUsername('');
              }}
              className="text-sm font-semibold text-green-700 hover:text-green-800 transition uppercase tracking-wider"
            >
              {isLoginMode 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Log in"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}