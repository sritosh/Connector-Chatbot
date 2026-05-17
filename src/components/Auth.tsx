import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Loader2, ArrowRight, Github, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function Auth({ onGuestAccess }: { onGuestAccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = !!(supabaseUrl && !supabaseUrl.includes('placeholder'));

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      const isVercel = window.location.hostname.includes('vercel.app');
      setError(isVercel 
        ? "Supabase variables are missing in Vercel settings. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are added to your Vercel Project Settings." 
        : "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to AI Studio Secrets (Settings menu).");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <ArrowRight className="text-white w-6 h-6 rotate-[-45deg]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUp ? 'Join Connector to find professional contacts' : 'Enter your details to access your account'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-green-400">{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                className={cn(
                  "w-full rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 group",
                  isSupabaseConfigured 
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-brand-bg px-4 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={loading || !isSupabaseConfigured}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google' as any)} // Using 'google' as provider
                  disabled={loading || !isSupabaseConfigured}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5" alt="Google" />
                  Google
                </button>
              </div>

              <button
                type="button"
                onClick={onGuestAccess}
                className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl py-2.5 text-sm font-semibold transition-all border border-white/10"
              >
                Continue as Guest (Free)
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-slate-400 text-xs hover:text-white transition-colors"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-blue-400 font-medium">Log in</span></>
              ) : (
                <>Don't have an account? <span className="text-blue-400 font-medium">Start for free</span></>
              )}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-600 text-[10px] uppercase tracking-[0.2em] font-medium">
          Connector AI Security Standard • v1.3.0
        </p>
      </motion.div>
    </div>
  );
}
