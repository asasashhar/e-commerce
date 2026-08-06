import { useEffect, useState } from 'react';
import { X, Check, Loader2, Lock, CreditCard, Wallet, Smartphone, Apple, Tag, CheckCircle2, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/context/CurrencyContext';
import type { Discount, ShopSettings } from '@/lib/types';

interface CheckoutProps {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'paypal', label: 'PayPal', icon: Wallet },
  { id: 'apple', label: 'Apple Pay', icon: Apple },
  { id: 'google', label: 'Google Pay', icon: Smartphone },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id'];

export default function Checkout({ open, onClose }: CheckoutProps) {
  const { items, subtotal, clear } = useCart();
  const { format } = useCurrency();
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  // Gift wrapping
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const GIFT_WRAP_COST = 5;

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [checkingDiscount, setCheckingDiscount] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as ShopSettings);
    });
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setStatus('idle');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const freeShipThreshold = settings?.free_shipping_threshold ?? 99;
  const taxRate = settings?.tax_rate ?? 0.08;

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === 'percentage'
      ? +(subtotal * (appliedDiscount.value / 100)).toFixed(2)
      : Math.min(appliedDiscount.value, subtotal)
    : 0;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const shipping = afterDiscount >= freeShipThreshold || afterDiscount === 0 ? 0 : 9;
  const giftWrapCost = giftWrap ? GIFT_WRAP_COST : 0;
  const tax = +(afterDiscount * taxRate).toFixed(2);
  const total = +(afterDiscount + shipping + giftWrapCost + tax).toFixed(2);

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setCheckingDiscount(true);
    setDiscountError('');

    const { data, error: err } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', discountCode.toUpperCase().trim())
      .eq('active', true)
      .maybeSingle();

    if (err || !data) {
      setDiscountError('Invalid or expired code.');
      setAppliedDiscount(null);
    } else {
      const discount = data as Discount;
      if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
        setDiscountError('This code has expired.');
        setAppliedDiscount(null);
      } else {
        setAppliedDiscount(discount);
        setDiscountError('');
      }
    }
    setCheckingDiscount(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address) {
      setError('Please fill in all fields.');
      return;
    }
    if (payment === 'card' && (!card.number || !card.expiry || !card.cvc)) {
      setError('Please enter your card details.');
      return;
    }
    setStatus('loading');
    setError('');

    try {
      const { error: insertError } = await supabase.from('orders').insert({
        customer_name: form.name,
        customer_email: form.email,
        shipping_address: form.address,
        items: items.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          size: item.size,
          color: item.color.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total,
        discount_code: appliedDiscount?.code ?? null,
        discount_amount: discountAmount,
        gift_wrap: giftWrap,
        gift_message: giftWrap ? giftMessage : null,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setStatus('success');
      clear();
      setAppliedDiscount(null);
      setDiscountCode('');
      setGiftWrap(false);
      setGiftMessage('');
      setTimeout(() => {
        onClose();
        setForm({ name: '', email: '', address: '' });
        setCard({ number: '', expiry: '', cvc: '' });
      }, 2500);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-500/20">
              <Check className="h-10 w-10 text-success-500" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold text-white">Order Confirmed!</h2>
            <p className="mt-2 text-sm text-ink-300">
              Thank you, {form.name || 'friend'}. A confirmation has been sent to your email.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="font-display text-xl font-bold text-white">Checkout</h2>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-6 py-5">
              {/* Order summary */}
              <div className="rounded-2xl border border-white/8 bg-ink-800/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Order Summary</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-ink-300"><span>Subtotal ({items.length} items)</span><span>{format(subtotal)}</span></div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-success-500">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span>-{format(discountAmount)}</span>
                    </div>
                  )}

                  {giftWrap && (
                    <div className="flex justify-between text-accent-400">
                      <span>Gift Wrapping 🎁</span>
                      <span>+{format(GIFT_WRAP_COST)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-ink-300"><span>Shipping</span><span>{shipping === 0 ? 'Free' : format(shipping)}</span></div>
                  <div className="flex justify-between text-ink-300"><span>Tax ({(taxRate * 100).toFixed(0)}%)</span><span>{format(tax)}</span></div>
                  <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-display text-lg font-bold text-white">
                    <span>Total</span><span>{format(total)}</span>
                  </div>
                </div>
              </div>

              {/* Discount code */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Discount Code</label>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between rounded-xl border border-success-500/30 bg-success-500/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success-500" />
                      <span className="text-sm font-medium text-white">{appliedDiscount.code} applied</span>
                    </div>
                    <button type="button" onClick={() => { setAppliedDiscount(null); setDiscountCode(''); }} className="text-xs text-ink-400 hover:text-white">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Enter code" className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500" />
                    </div>
                    <button type="button" onClick={applyDiscount} disabled={checkingDiscount || !discountCode.trim()} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50">
                      {checkingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
                {discountError && <p className="mt-1.5 text-xs text-error-500">{discountError}</p>}
              </div>

              {/* Gift Wrapping */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setGiftWrap((v) => !v)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
                    giftWrap
                      ? 'border-accent-400/50 bg-accent-400/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  id="gift-wrap-toggle"
                >
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                    giftWrap ? 'bg-accent-400/20' : 'bg-white/5'
                  }`}>
                    <Gift className={`h-4 w-4 ${giftWrap ? 'text-accent-400' : 'text-ink-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${giftWrap ? 'text-white' : 'text-ink-300'}`}>Add Gift Wrapping</p>
                    <p className="text-xs text-ink-500">Premium packaging + personalized message · +{format(GIFT_WRAP_COST)}</p>
                  </div>
                  <div className={`h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all ${
                    giftWrap ? 'border-accent-400 bg-accent-400' : 'border-white/20'
                  }`}>
                    {giftWrap && <Check className="h-full w-full p-0.5 text-ink-950" />}
                  </div>
                </button>

                {giftWrap && (
                  <div className="mt-3 animate-fade-in">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Gift Message (optional)</label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Write a personal message for the recipient…"
                      rows={2}
                      maxLength={200}
                      className={`${inputCls} resize-none`}
                    />
                    <p className="mt-1 text-right text-xs text-ink-500">{giftMessage.length}/200</p>
                  </div>
                )}
              </div>

              {/* Form fields */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Shipping Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, Apt 4B&#10;New York, NY 10001" rows={3} className={`${inputCls} resize-none`} />
                </div>
              </div>

              {/* Payment methods */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} type="button" onClick={() => setPayment(method.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${payment === method.id ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-white/10 text-ink-300 hover:border-white/30'}`}>
                      <method.icon className="h-4 w-4" /><span className="truncate">{method.label}</span>
                    </button>
                  ))}
                </div>

                {payment === 'card' && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    <input type="text" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="Card number" className={inputCls} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM / YY" className={inputCls} />
                      <input type="text" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="CVC" className={inputCls} />
                    </div>
                  </div>
                )}

                {payment !== 'card' && (
                  <div className="mt-3 rounded-xl border border-white/8 bg-ink-800/50 px-4 py-3 text-sm text-ink-400 animate-fade-in">
                    You'll be redirected to {PAYMENT_METHODS.find((m) => m.id === payment)?.label} to complete your payment securely.
                  </div>
                )}
              </div>

              {error && <p className="mt-4 rounded-lg bg-error-500/10 px-4 py-2 text-sm text-error-500">{error}</p>}

              <button type="submit" disabled={status === 'loading' || items.length === 0} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                {status === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><Lock className="h-4 w-4" /> Pay {format(total)}</>}
              </button>
              <p className="mt-3 text-center text-xs text-ink-500">This is a demo store — no real payment is processed.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500';
