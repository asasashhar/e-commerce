import { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Mail, Hash, ArrowLeft, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OrderRow } from '@/lib/types';

interface OrderTrackingProps {
  onBack: () => void;
}

const TIMELINE = [
  { status: 'pending', label: 'Order Placed', icon: Clock, desc: 'Your order has been received' },
  { status: 'paid', label: 'Order Accepted', icon: CheckCircle2, desc: 'Your order has been confirmed' },
  { status: 'processing', label: 'Ready to Ship', icon: Package, desc: 'Your order is packed and ready' },
  { status: 'shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on the way' },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Your order has arrived' },
];

const STATUS_ORDER = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderTracking({ onBack }: OrderTrackingProps) {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderRow | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !orderId.trim()) {
      setError('Please enter both your email and order ID.');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId.trim())
      .ilike('customer_email', email.trim())
      .maybeSingle();

    if (err || !data) {
      setError('No order found. Check your email and order ID and try again.');
      setOrder(null);
    } else {
      setOrder(data as OrderRow);
    }
    setLoading(false);
  };

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 sm:px-8">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-white">Track Your Order</h1>
          <p className="mt-2 text-sm text-ink-400">Enter your email and order ID to see your delivery status.</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mt-8 rounded-3xl border border-white/10 bg-ink-900/60 p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Order ID</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="abc12345-..." className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500" />
              </div>
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg bg-error-500/10 px-4 py-2 text-sm text-error-500">{error}</p>}

          <button type="submit" disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Track Order</>}
          </button>
        </form>

        {/* Order result */}
        {order && (
          <div className="mt-6 animate-fade-up rounded-3xl border border-white/10 bg-ink-900/60 p-6 backdrop-blur-xl">
            {isCancelled ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-500/15">
                  <XCircle className="h-8 w-8 text-error-500" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-white">Order Cancelled</h2>
                <p className="mt-1 text-sm text-ink-400">This order has been cancelled. Please contact support if you have questions.</p>
              </div>
            ) : (
              <>
                {/* Order header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-ink-500">Order ID</p>
                    <p className="font-mono text-sm font-semibold text-white">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-500">Total</p>
                    <p className="font-display text-lg font-bold text-white">${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>

                {/* Tracking info */}
                {order.tracking_id && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-3">
                    <Truck className="h-5 w-5 text-brand-400" />
                    <div>
                      <p className="text-xs text-ink-400">{order.courier ?? 'Courier'} Tracking Number</p>
                      <p className="font-mono text-sm font-bold text-white">{order.tracking_id}</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="mt-6">
                  {TIMELINE.map((step, i) => {
                    const isComplete = i <= currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${isComplete ? 'bg-brand-500 text-white' : 'bg-ink-800 text-ink-600'} ${isCurrent ? 'ring-4 ring-brand-500/30' : ''}`}>
                            <step.icon className="h-5 w-5" />
                          </div>
                          {i < TIMELINE.length - 1 && (
                            <div className={`my-1 w-0.5 h-8 rounded-full transition-all duration-500 ${i < currentStep ? 'bg-brand-500' : 'bg-ink-800'}`} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className={`text-sm font-semibold ${isComplete ? 'text-white' : 'text-ink-500'}`}>{step.label}</p>
                          <p className="text-xs text-ink-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="mt-4 rounded-2xl border border-white/8 bg-ink-800/50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Items in this order</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-ink-200">{item.name} · Size {item.size} · {item.color}</span>
                        <span className="text-ink-300">{item.quantity} × ${item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping address */}
                <div className="mt-4 flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-500" />
                  <div>
                    <p className="text-xs text-ink-500">Shipping to</p>
                    <p className="text-ink-200">{order.shipping_address}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
