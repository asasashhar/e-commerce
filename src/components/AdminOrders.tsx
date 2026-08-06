import { useEffect, useMemo, useState } from 'react';
import { Loader2, Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, TrendingUp, RefreshCw, Search, Send, MapPin, Mail, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OrderRow } from '@/lib/types';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-warning-500 bg-warning-500/10', border: 'border-warning-500/20' },
  paid: { label: 'Accepted', icon: CheckCircle2, color: 'text-success-500 bg-success-500/10', border: 'border-success-500/20' },
  processing: { label: 'Ready to Ship', icon: Package, color: 'text-brand-400 bg-brand-500/10', border: 'border-brand-500/20' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-brand-400 bg-brand-500/10', border: 'border-brand-500/20' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-success-500 bg-success-500/10', border: 'border-success-500/20' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-error-500 bg-error-500/10', border: 'border-error-500/20' },
} as const;

const NEXT_ACTION: Record<string, { status: string; label: string }> = {
  pending: { status: 'paid', label: 'Accept Order' },
  paid: { status: 'processing', label: 'Mark Ready to Ship' },
  processing: { status: 'shipped', label: 'Ship Order' },
  shipped: { status: 'delivered', label: 'Mark Delivered' },
};

const COURIERS = ['FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Logistics', 'Other'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [shipOrder, setShipOrder] = useState<OrderRow | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setLoading(false);
  };

  const updateOrder = async (id: string, updates: Record<string, string>) => {
    setUpdating(id);
    const { error: err } = await supabase.from('orders').update(updates).eq('id', id);
    if (!err) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
    }
    setUpdating(null);
  };

  const advanceStatus = (order: OrderRow) => {
    const next = NEXT_ACTION[order.status];
    if (!next) return;
    if (next.status === 'shipped') {
      setShipOrder(order);
      return;
    }
    updateOrder(order.id, { status: next.status });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.tracking_id ?? '').toLowerCase().includes(q)
    );
  }, [orders, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, OrderRow[]> = {};
    for (const order of filtered) {
      if (!groups[order.status]) groups[order.status] = [];
      groups[order.status].push(order);
    }
    return groups;
  }, [filtered]);

  const revenue = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'pending').reduce((s, o) => s + Number(o.total), 0);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  if (error) {
    return <div className="px-6 py-10 text-center text-sm text-error-500">{error}</div>;
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <MiniStat icon={TrendingUp} label="Revenue" value={`$${revenue.toFixed(0)}`} />
        <MiniStat icon={Clock} label="Pending" value={orders.filter((o) => o.status === 'pending').length.toString()} />
        <MiniStat icon={Package} label="Ready to Ship" value={orders.filter((o) => o.status === 'processing').length.toString()} />
        <MiniStat icon={Truck} label="Shipped" value={orders.filter((o) => o.status === 'shipped' || o.status === 'delivered').length.toString()} />
      </div>

      {/* Search + refresh */}
      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, order ID, or tracking number..."
            className="w-full rounded-xl border border-white/10 bg-ink-800 py-2.5 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
          />
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-ink-300 transition-colors hover:border-white/30 hover:text-white">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Status sections */}
      <div className="mt-6 space-y-6">
        {Object.keys(STATUS_CONFIG).map((statusKey) => {
          const group = grouped[statusKey] ?? [];
          if (group.length === 0) return null;
          const config = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG];
          return (
            <div key={statusKey} className={`rounded-3xl border ${config.border} bg-ink-900/40`}>
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
                  <config.icon className="h-3.5 w-3.5" /> {config.label}
                </span>
                <span className="text-xs text-ink-500">{group.length} order{group.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-white/5">
                {group.map((order) => {
                  const next = NEXT_ACTION[order.status];
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <div key={order.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-white/5">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{order.customer_name}</p>
                        <p className="text-xs text-ink-500">{order.customer_email} · {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <span className="text-sm text-ink-300">{itemCount} items</span>
                      <span className="font-display font-bold text-white">${Number(order.total).toFixed(2)}</span>
                      {order.tracking_id && (
                        <span className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-400">
                          <Hash className="h-3 w-3" /> {order.tracking_id}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        {next && (
                          <button
                            onClick={() => advanceStatus(order)}
                            disabled={updating === order.id}
                            className="rounded-full bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-400 transition-colors hover:bg-brand-500 hover:text-white disabled:opacity-50"
                          >
                            {updating === order.id ? '...' : next.label}
                          </button>
                        )}
                        <button onClick={() => setSelected(order)} className="flex items-center gap-1 text-xs font-medium text-ink-400 transition-colors hover:text-white">
                          Details <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/8 bg-ink-800/30 px-6 py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-ink-600" />
            <p className="mt-3 text-sm text-ink-400">{search ? 'No orders match your search.' : 'No orders yet.'}</p>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h3 className="font-display text-lg font-bold text-white">Order Details</h3>
              <button onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="space-y-2 text-sm">
                <DetailRow icon={Mail} label="Customer" value={selected.customer_name} />
                <DetailRow icon={Mail} label="Email" value={selected.customer_email} />
                <DetailRow icon={MapPin} label="Address" value={selected.shipping_address} />
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CONFIG[selected.status as keyof typeof STATUS_CONFIG]?.color}`}>
                    {STATUS_CONFIG[selected.status as keyof typeof STATUS_CONFIG]?.label}
                  </span>
                </div>
                {selected.tracking_id && (
                  <div className="flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/10 px-4 py-2.5">
                    <Truck className="h-4 w-4 text-brand-400" />
                    <div>
                      <p className="text-xs text-ink-400">Tracking: {selected.courier ?? 'Courier'}</p>
                      <p className="font-mono text-sm font-semibold text-white">{selected.tracking_id}</p>
                    </div>
                  </div>
                )}
                {selected.discount_code && (
                  <p className="text-sm text-success-500">Discount: {selected.discount_code} (-${Number(selected.discount_amount).toFixed(2)})</p>
                )}
              </div>
              <div className="mt-5 rounded-2xl border border-white/8 bg-ink-800/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-ink-200">{item.name} · Size {item.size} · {item.color}</span>
                      <span className="text-ink-300">{item.quantity} × ${item.price}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-display font-bold text-white">
                    <span>Total</span><span>${Number(selected.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateOrder(selected.id, { status })}
                      disabled={updating === selected.id}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                        selected.status === status ? `${config.color} border-transparent` : 'border-white/10 text-ink-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <config.icon className="h-3 w-3" /> {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ship modal — enter tracking ID */}
      {shipOrder && (
        <ShipModal
          order={shipOrder}
          onClose={() => setShipOrder(null)}
          onConfirm={(trackingId, courier) => {
            updateOrder(shipOrder.id, { status: 'shipped', tracking_id: trackingId, courier });
            setShipOrder(null);
          }}
        />
      )}
    </div>
  );
}

function ShipModal({ order, onClose, onConfirm }: { order: OrderRow; onClose: () => void; onConfirm: (trackingId: string, courier: string) => void }) {
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState(COURIERS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    onConfirm(trackingId.trim(), courier);
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h3 className="font-display text-lg font-bold text-white">Ship Order</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><XCircle className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <p className="mb-4 text-sm text-ink-300">
            Enter the tracking number from your courier. The customer will be able to track their package with this ID.
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Courier Company</label>
              <select value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-brand-500">
                {COURIERS.map((c) => <option key={c} value={c} className="bg-ink-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Tracking Number</label>
              <input type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="e.g. 1Z999AA10123456784" className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500" autoFocus />
            </div>
          </div>
          <button type="submit" disabled={!trackingId.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-400 active:scale-95 disabled:opacity-50">
            <Send className="h-4 w-4" /> Confirm Shipment
          </button>
        </form>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-800/40 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400"><Icon className="h-4 w-4" /></div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
          <p className="font-display text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-500" />
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-sm text-ink-200">{value}</p>
      </div>
    </div>
  );
}
