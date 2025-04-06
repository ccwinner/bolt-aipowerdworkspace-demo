import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

interface LoginProps {
  isDarkMode: boolean;
}

export function Login({ isDarkMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Login successful - you can handle the redirect or state update here
      setSuccess('Login successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;
      
      setSuccess('Sign up successful! You can now log in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-black p-4">
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-spotify-dark-base' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <h2 className="text-2xl font-bold text-center mb-8 text-spotify-white-text">
          Welcome To AI Workspace
        </h2>
        
        <form className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg">
              <AlertCircle size={20} />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-spotify-light-text mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-3 rounded-lg bg-spotify-light-black text-spotify-white-text placeholder-spotify-light-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-spotify-light-text mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-spotify-light-black text-spotify-white-text placeholder-spotify-light-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-spotify-green hover:bg-spotify-green/90 text-white rounded-lg font-medium transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <LogIn size={20} />
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-spotify-green text-spotify-green hover:bg-spotify-green/10 rounded-lg font-medium transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus size={20} />
              <span>Sign Up</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}