import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronRight,
  RefreshCw,
  Search,
  Send,
  MapPin,
  Mail,
  Hash,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Check,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OrderRow } from '@/lib/types';

export type OrderStage = 'orders' | 'ready_to_ship' | 'shipped' | 'delivered' | 'all' | 'cancelled';

const STATUS_CONFIG = {
  pending: { label: 'New / Pending', icon: Clock, color: 'text-warning-400 bg-warning-500/10', border: 'border-warning-500/20' },
  paid: { label: 'Accepted', icon: CheckCircle2, color: 'text-brand-400 bg-brand-500/10', border: 'border-brand-500/20' },
  processing: { label: 'Ready to Ship', icon: Package, color: 'text-brand-400 bg-brand-500/10', border: 'border-brand-500/20' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/20' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/20' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-error-400 bg-error-500/10', border: 'border-error-500/20' },
} as const;

const COURIERS = ['FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Logistics', 'Other'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [shipOrder, setShipOrder] = useState<OrderRow | null>(null);
  const [activeStage, setActiveStage] = useState<OrderStage>('orders');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setLoading(false);
  };

  const updateOrder = async (id: string, updates: Partial<OrderRow>) => {
    setUpdating(id);
    const { error: err } = await supabase.from('orders').update(updates).eq('id', id);
    if (!err) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
    }
    setUpdating(null);
  };

  // Stage counts for upper section cards
  const stageCounts = useMemo(() => {
    return {
      orders: orders.filter((o) => o.status === 'pending' || o.status === 'paid').length,
      ready_to_ship: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      all: orders.length,
    };
  }, [orders]);

  const stages = [
    {
      id: 'orders' as OrderStage,
      number: '1',
      title: 'Order',
      subtext: 'New & Accepted',
      icon: Clock,
      count: stageCounts.orders,
      color: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
      activeRing: 'ring-amber-500/50 bg-amber-500/10',
    },
    {
      id: 'ready_to_ship' as OrderStage,
      number: '2',
      title: 'Ready to Ship',
      subtext: 'Packed & Labeled',
      icon: Package,
      count: stageCounts.ready_to_ship,
      color: 'from-brand-500/20 to-brand-500/5 text-brand-400 border-brand-500/30',
      activeRing: 'ring-brand-500/50 bg-brand-500/10',
    },
    {
      id: 'shipped' as OrderStage,
      number: '3',
      title: 'Shipped',
      subtext: 'In Transit',
      icon: Truck,
      count: stageCounts.shipped,
      color: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
      activeRing: 'ring-blue-500/50 bg-blue-500/10',
    },
    {
      id: 'delivered' as OrderStage,
      number: '4',
      title: 'Delivered',
      subtext: 'Completed Delivery',
      icon: CheckCircle2,
      count: stageCounts.delivered,
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
      activeRing: 'ring-emerald-500/50 bg-emerald-500/10',
    },
  ];

  // Filter orders by active stage & search
  const filteredOrders = useMemo(() => {
    let list = orders;

    // Stage filtering
    if (activeStage === 'orders') {
      list = list.filter((o) => o.status === 'pending' || o.status === 'paid');
    } else if (activeStage === 'ready_to_ship') {
      list = list.filter((o) => o.status === 'processing');
    } else if (activeStage === 'shipped') {
      list = list.filter((o) => o.status === 'shipped');
    } else if (activeStage === 'delivered') {
      list = list.filter((o) => o.status === 'delivered');
    } else if (activeStage === 'cancelled') {
      list = list.filter((o) => o.status === 'cancelled');
    }

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.tracking_id ?? '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, activeStage, search]);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return <div className="px-6 py-10 text-center text-sm text-error-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* 4 UPPER SECTIONS: 1. ORDER | 2. READY TO SHIP | 3. SHIPPED | 4. DELIVERED */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Fulfillment Workflow Pipeline
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStage('all')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeStage === 'all'
                  ? 'bg-white text-ink-950 shadow-md'
                  : 'text-ink-400 hover:text-white bg-white/5'
              }`}
            >
              All ({stageCounts.all})
            </button>
            {stageCounts.cancelled > 0 && (
              <button
                onClick={() => setActiveStage('cancelled')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  activeStage === 'cancelled'
                    ? 'bg-error-500 text-white'
                    : 'text-error-400 hover:bg-error-500/10'
                }`}
              >
                Cancelled ({stageCounts.cancelled})
              </button>
            )}
          </div>
        </div>

        {/* The 4 Upper Section Cards (Medium Sized) */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((st) => {
            const isSelected = activeStage === st.id;
            const Icon = st.icon;

            return (
              <button
                key={st.id}
                onClick={() => setActiveStage(st.id)}
                className={`group relative flex items-center justify-between overflow-hidden rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ${
                  isSelected
                    ? `border-white/30 bg-gradient-to-r ${st.color} shadow-md ring-1 ${st.activeRing}`
                    : 'border-white/10 bg-ink-900/60 hover:border-white/20 hover:bg-ink-900/90'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      isSelected ? 'bg-white text-ink-950 shadow-sm' : 'bg-white/10 text-white group-hover:bg-white/15'
                    }`}
                  >
                    {st.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-white truncate leading-tight">
                      {st.title}
                    </h3>
                    <p className="text-[11px] text-ink-400 truncate mt-0.5">{st.subtext}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-white text-ink-950 shadow-sm'
                        : 'bg-white/10 text-ink-200 group-hover:bg-white/15'
                    }`}
                  >
                    {st.count}
                  </span>
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isSelected ? 'text-white' : 'text-ink-500 group-hover:text-ink-400'
                    }`}
                  />
                </div>

                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter Bar and Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/5 pt-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeStage.replace(/_/g, ' ')} by customer, email, order ID, courier...`}
            className="w-full rounded-xl border border-white/10 bg-ink-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400 hidden sm:inline">
            Showing <strong className="text-white">{filteredOrders.length}</strong> order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-xs font-medium text-ink-300 transition-colors hover:border-white/30 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-ink-900/40 py-16 text-center">
            <Package className="h-10 w-10 text-ink-600" />
            <h3 className="mt-3 font-display text-base font-bold text-white">No Orders In This Stage</h3>
            <p className="mt-1 text-xs text-ink-400">
              {search ? 'Try clearing your search term.' : `There are currently no orders under "${activeStage.replace(/_/g, ' ')}".`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 p-5 backdrop-blur-sm transition-all hover:border-brand-500/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Customer and Order ID */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-display text-base font-bold text-white">
                        {order.customer_name}
                      </h4>
                      <span className="font-mono text-xs text-ink-400">
                        #{order.id.slice(0, 10)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig.color}`}
                      >
                        <statusConfig.icon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-ink-400 flex items-center gap-2">
                      <span>{order.customer_email}</span>
                      <span>•</span>
                      <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="text-ink-300">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    </p>

                    <p className="mt-1 text-xs text-ink-500 truncate max-w-md">
                      📍 {order.shipping_address}
                    </p>
                  </div>

                  {/* Pricing and Tracking ID if any */}
                  <div className="flex items-center gap-4">
                    {order.tracking_id && (
                      <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                          {order.courier || 'Courier'}
                        </p>
                        <p className="font-mono text-xs font-semibold text-white">
                          {order.tracking_id}
                        </p>
                      </div>
                    )}

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-ink-400">Total</p>
                      <p className="font-display text-lg font-bold text-white">
                        ${Number(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workflow Action Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(order)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      View Items & Details <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* FUNCTIONAL WORKFLOW BUTTONS ACCORDING TO STAGES */}
                  <div className="flex items-center gap-2">
                    {/* Stage 1: Order (pending or paid) -> Advance to processing */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrder(order.id, { status: 'paid' })}
                        disabled={updating === order.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-400 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept Order
                      </button>
                    )}

                    {(order.status === 'pending' || order.status === 'paid') && (
                      <button
                        onClick={() => updateOrder(order.id, { status: 'processing' })}
                        disabled={updating === order.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                      >
                        <Package className="h-3.5 w-3.5" /> Move to Ready to Ship
                      </button>
                    )}

                    {/* Stage 2: Ready to Ship (processing) -> Ship order (enter tracking) */}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => setShipOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        <Truck className="h-3.5 w-3.5" /> Ship Order & Assign Tracking
                      </button>
                    )}

                    {/* Stage 3: Shipped -> Mark Delivered */}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrder(order.id, { status: 'delivered' })}
                        disabled={updating === order.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Delivered
                      </button>
                    )}

                    {/* Stage 4: Delivered -> Complete Badge */}
                    {order.status === 'delivered' && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Delivery Fulfilled
                      </span>
                    )}

                    {/* Cancel action if not yet shipped or delivered */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this order?')) {
                            updateOrder(order.id, { status: 'cancelled' });
                          }
                        }}
                        className="text-xs text-ink-500 hover:text-error-400 transition-colors px-2 py-1"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h3 className="font-display text-lg font-bold text-white">Order Details</h3>
              <button onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-2 text-sm">
                <DetailRow icon={Mail} label="Customer Name" value={selected.customer_name} />
                <DetailRow icon={Mail} label="Customer Email" value={selected.customer_email} />
                <DetailRow icon={MapPin} label="Delivery Address" value={selected.shipping_address} />
                <div className="flex items-center gap-2 pt-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CONFIG[selected.status as keyof typeof STATUS_CONFIG]?.color}`}>
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
                  <p className="text-sm text-emerald-400">
                    Promo Code: <strong>{selected.discount_code}</strong> (-${Number(selected.discount_amount).toFixed(2)})
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="rounded-2xl border border-white/8 bg-ink-800/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Purchased Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-ink-200">{item.name} · Size {item.size} · {item.color}</span>
                      <span className="text-ink-300">{item.quantity} × ${item.price}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-display font-bold text-white">
                    <span>Total Amount</span>
                    <span>${Number(selected.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Change status directly */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Override Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
                    <button
                      key={statusKey}
                      onClick={() => updateOrder(selected.id, { status: statusKey })}
                      disabled={updating === selected.id}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        selected.status === statusKey
                          ? `${config.color} border-transparent`
                          : 'border-white/10 text-ink-400 hover:border-white/30 hover:text-white'
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

      {/* Ship modal — enter tracking ID & courier */}
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

function ShipModal({
  order,
  onClose,
  onConfirm,
}: {
  order: OrderRow;
  onClose: () => void;
  onConfirm: (trackingId: string, courier: string) => void;
}) {
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
          <h3 className="font-display text-lg font-bold text-white">Ship Order #{order.id.slice(0, 8)}</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <p className="mb-4 text-xs text-ink-300">
            Assign the courier company and tracking number. The customer will be able to track their package in real-time.
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Courier Company</label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-brand-500"
              >
                {COURIERS.map((c) => (
                  <option key={c} value={c} className="bg-ink-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Tracking Number *</label>
              <input
                type="text"
                required
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. KW-9842104 or 1Z999AA1012345"
                className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
                autoFocus
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!trackingId.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-400 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Confirm Shipment & Move to Shipped
          </button>
        </form>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-500" />
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-sm text-ink-200">{value}</p>
      </div>
    </div>
  );
}
