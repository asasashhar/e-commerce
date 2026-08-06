import { useState } from 'react';
import { X, Mail, Bell, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NotifyModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

export default function NotifyModal({ productId, productName, onClose }: NotifyModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setError('');

    const { error: insertError } = await supabase
      .from('stock_notifications')
      .insert({ product_id: productId, email: email.toLowerCase().trim() });

    if (insertError) {
      // Duplicate entry is fine (unique constraint)
      if (insertError.code === '23505') {
        setStatus('success');
      } else {
        setError(insertError.message);
        setStatus('error');
      }
    } else {
      setStatus('success');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        {status === 'success' ? (
          <div className="flex flex-col items-center px-8 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-500/20">
              <CheckCircle2 className="h-8 w-8 text-success-500" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-white">You're on the list!</h3>
            <p className="mt-2 text-sm text-ink-400">
              We'll email you the moment <span className="text-white">{productName}</span> is back in stock.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-brand-500 px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-400"
            >
              Got it!
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15">
                <Bell className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Notify Me</h3>
                <p className="text-xs text-ink-400">When back in stock</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-ink-300">
              <span className="font-medium text-white">{productName}</span> is currently out of stock.
              Enter your email and we'll let you know as soon as it's available.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
                />
              </div>

              {error && <p className="text-xs text-error-500">{error}</p>}

              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-400 active:scale-95 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Bell className="h-4 w-4" /> Notify Me</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
