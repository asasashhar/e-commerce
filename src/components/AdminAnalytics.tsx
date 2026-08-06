import { useEffect, useRef, useState } from 'react';
import { Loader2, TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { OrderRow, Product } from '@/lib/types';

type Period = '7d' | '30d';

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: true }),
        supabase.from('products').select('*'),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data as OrderRow[]);
      if (productsRes.data) setProducts(productsRes.data as Product[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const revenue = validOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? revenue / (validOrders.length || 1) : 0;

  // Build date buckets for selected period
  const days = period === '7d' ? 7 : 30;
  const buckets: { label: string; value: number; date: Date }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayRevenue = validOrders
      .filter((o) => {
        const created = new Date(o.created_at);
        return created >= dayStart && created < nextDay;
      })
      .reduce((s, o) => s + Number(o.total), 0);
    const label =
      period === '7d'
        ? dayStart.toLocaleDateString('en-US', { weekday: 'short' })
        : dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets.push({ label, value: dayRevenue, date: dayStart });
  }

  // Previous period comparison
  const currentTotal = buckets.reduce((s, b) => s + b.value, 0);
  const prevBuckets: number[] = [];
  for (let i = days * 2 - 1; i >= days; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayRev = validOrders
      .filter((o) => {
        const created = new Date(o.created_at);
        return created >= dayStart && created < nextDay;
      })
      .reduce((s, o) => s + Number(o.total), 0);
    prevBuckets.push(dayRev);
  }
  const prevTotal = prevBuckets.reduce((s, v) => s + v, 0);
  const pctChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
  const isUp = pctChange >= 0;

  // SVG line chart
  const chartW = 600;
  const chartH = 180;
  const padX = 16;
  const padY = 16;
  const maxVal = Math.max(...buckets.map((b) => b.value), 1);
  const points = buckets.map((b, i) => {
    const x = padX + (i / (buckets.length - 1)) * (chartW - padX * 2);
    const y = chartH - padY - (b.value / maxVal) * (chartH - padY * 2);
    return { x, y, ...b };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  // Area path
  const areaPath = points.length > 1
    ? `M${points[0].x},${chartH - padY} L${points.map((p) => `${p.x},${p.y}`).join(' L')} L${points[points.length - 1].x},${chartH - padY} Z`
    : '';

  // Top products
  const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const order of validOrders) {
    for (const item of order.items) {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { name: item.name, count: 0, revenue: 0 };
      }
      productSales[item.product_id].count += item.quantity;
      productSales[item.product_id].revenue += item.quantity * item.price;
    }
  }
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxProductRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  // Status distribution
  const statusCounts: Record<string, number> = {};
  for (const order of orders) {
    statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1;
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${revenue.toFixed(2)}`} color="text-success-500" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders.toString()} color="text-brand-400" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} color="text-accent-500" />
        <StatCard icon={Package} label="Products" value={products.length.toString()} color="text-brand-400" />
      </div>

      {/* SVG Line Chart */}
      <div className="mt-6 rounded-3xl border border-white/8 bg-ink-900/50 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-400" />
            <h3 className="font-display text-base font-bold text-white">Revenue Trend</h3>
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isUp ? 'bg-success-500/15 text-success-500' : 'bg-error-500/15 text-error-500'}`}>
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(pctChange).toFixed(1)}% vs prev period
            </div>
          </div>
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            {(['7d', '30d'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-brand-500 text-white'
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full overflow-visible"
            style={{ height: 200 }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#339eff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#339eff" stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75, 1].map((frac) => {
              const y = chartH - padY - frac * (chartH - padY * 2);
              return (
                <line
                  key={frac}
                  x1={padX}
                  y1={y}
                  x2={chartW - padX}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area fill */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGrad)" />
            )}

            {/* Line */}
            {points.length > 1 && (
              <polyline
                points={polyline}
                fill="none"
                stroke="#339eff"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            )}

            {/* Data points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={p.value > 0 ? '#339eff' : 'transparent'}
                  stroke={p.value > 0 ? '#1464e1' : 'transparent'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-7"
                  onMouseEnter={() => setTooltip({ x: p.x, y: p.y, label: p.label, value: p.value })}
                  onMouseLeave={() => setTooltip(null)}
                />
              </g>
            ))}

            {/* X-axis labels — show subset to avoid crowding */}
            {points
              .filter((_, i) => {
                const step = period === '7d' ? 1 : Math.ceil(points.length / 7);
                return i % step === 0 || i === points.length - 1;
              })
              .map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={chartH + 2}
                  textAnchor="middle"
                  className="fill-ink-500 text-[10px]"
                  fontSize="10"
                  fill="rgba(125,132,151,0.8)"
                >
                  {p.label}
                </text>
              ))}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full animate-fade-in rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-sm shadow-xl"
              style={{ left: `${(tooltip.x / chartW) * 100}%`, top: `${(tooltip.y / chartH) * 100}%` }}
            >
              <p className="font-semibold text-white">${tooltip.value.toFixed(2)}</p>
              <p className="text-xs text-ink-400">{tooltip.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="mt-6 rounded-3xl border border-white/8 bg-ink-900/50 p-6">
        <h3 className="mb-4 font-display text-base font-bold text-white">Top Products by Revenue</h3>
        {topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">No sales yet.</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-xs font-bold text-brand-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-white">{product.name}</p>
                    <p className="text-sm font-semibold text-white">${product.revenue.toFixed(2)}</p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
                      style={{ width: `${(product.revenue / maxProductRevenue) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{product.count} sold</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status distribution */}
      <div className="mt-6 rounded-3xl border border-white/8 bg-ink-900/50 p-6">
        <h3 className="mb-4 font-display text-base font-bold text-white">Orders by Status</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="rounded-2xl border border-white/8 bg-ink-800/40 p-4 text-center">
              <p className="font-display text-2xl font-bold text-white">{count}</p>
              <p className="mt-0.5 text-xs capitalize text-ink-400">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof DollarSign; label: string; value: string; color: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-ink-800/50 to-ink-900/50 p-6">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
          <p className="font-display text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
