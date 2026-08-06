import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Mail, MapPin, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OrderRow } from '@/lib/types';

interface Customer {
  name: string;
  email: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

export default function AdminCustomers() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) setOrders(data as OrderRow[]);
      setLoading(false);
    })();
  }, []);

  const customers = useMemo<Customer[]>(() => {
    const map: Record<string, Customer> = {};
    for (const order of orders) {
      const key = order.customer_email.toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: order.customer_name,
          email: order.customer_email,
          address: order.shipping_address,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: order.created_at,
        };
      }
      if (order.status !== 'cancelled') {
        map[key].totalSpent += Number(order.total);
      }
      map[key].orderCount += 1;
      if (new Date(order.created_at) > new Date(map[key].lastOrder)) {
        map[key].lastOrder = order.created_at;
      }
    }
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [customers, search]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat icon={Users} label="Total Customers" value={customers.length.toString()} />
        <MiniStat icon={TrendingUp} label="Total Revenue" value={`$${totalRevenue.toFixed(0)}`} />
        <MiniStat icon={ShoppingBag} label="Avg per Customer" value={`$${customers.length > 0 ? (totalRevenue / customers.length).toFixed(0) : 0}`} />
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full rounded-xl border border-white/10 bg-ink-800 py-2.5 pl-11 pr-4 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500"
          />
        </div>
      </div>

      {/* Customer list */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((customer) => (
          <div key={customer.email} className="rounded-2xl border border-white/8 bg-ink-800/40 p-5 transition-colors hover:border-white/20">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/15 font-display text-lg font-bold text-brand-400">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{customer.name}</p>
                <p className="flex items-center gap-1 truncate text-xs text-ink-500"><Mail className="h-3 w-3" /> {customer.email}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-ink-900/50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Orders</p>
                <p className="font-display text-lg font-bold text-white">{customer.orderCount}</p>
              </div>
              <div className="rounded-xl bg-ink-900/50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Spent</p>
                <p className="font-display text-lg font-bold text-white">${customer.totalSpent.toFixed(0)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-1.5 text-xs text-ink-500">
              <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-2">{customer.address}</span>
            </div>
            <p className="mt-2 text-xs text-ink-500">Last order: {new Date(customer.lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/8 bg-ink-800/30 px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-ink-600" />
            <p className="mt-3 text-sm text-ink-400">{search ? 'No customers match your search.' : 'No customers yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
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
