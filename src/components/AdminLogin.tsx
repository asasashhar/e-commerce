import { useState } from 'react';
import { Loader2, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminLoginProps {
  onBack: () => void;
}

export default function AdminLogin({ onBack }: AdminLoginProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fn = mode === 'signin' ? signIn : signUp;
    const { error: err } = await fn(email, password);

    if (err) {
      setError(err);
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-20">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to store
        </button>

        <div className="rounded-3xl border border-white/10 bg-ink-900/80 p-8 backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-white">
              {mode === 'signin' ? 'Admin Sign In' : 'Create Admin Account'}
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              {mode === 'signin'
                ? 'Access the orders dashboard'
                : 'Sign up to manage your store'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stride.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-error-500/10 px-4 py-2 text-sm text-error-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Please wait...
                </>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-400">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="font-semibold text-brand-400 transition-colors hover:text-brand-300"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
