import { useState, useEffect } from 'react';
import {
  LogOut,
  Package,
  ClipboardList,
  Tag,
  Settings,
  BarChart3,
  Users,
  Camera,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  ShoppingBag,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminDiscounts from './AdminDiscounts';
import AdminSettings from './AdminSettings';
import AdminAnalytics from './AdminAnalytics';
import AdminCustomers from './AdminCustomers';
import AdminLookbook from './AdminLookbook';
import AdminBranches from './AdminBranches';

export type Tab =
  | 'analytics'
  | 'orders'
  | 'products'
  | 'branches'
  | 'customers'
  | 'lookbook'
  | 'discounts'
  | 'settings';

interface TabItem {
  id: Tab;
  label: string;
  description: string;
  icon: typeof BarChart3;
  section: 'analytics' | 'commerce' | 'stores' | 'content' | 'config';
  badge?: string | number;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [counts, setCounts] = useState<{
    orders: number;
    pendingOrders: number;
    products: number;
    branches: number;
    discounts: number;
  }>({
    orders: 0,
    pendingOrders: 0,
    products: 0,
    branches: 0,
    discounts: 0,
  });

  // Fetch quick metrics for sidebar badges
  useEffect(() => {
    async function loadCounts() {
      try {
        const [ordersRes, productsRes, branchesRes, discountsRes] = await Promise.all([
          supabase.from('orders').select('id, status'),
          supabase.from('products').select('id'),
          supabase.from('branches').select('id'),
          supabase.from('discounts').select('id, active'),
        ]);

        const ordersList = (ordersRes.data as any[]) || [];
        const pendingCount = ordersList.filter((o) => o.status === 'pending').length;
        const productsList = (productsRes.data as any[]) || [];
        const branchesList = (branchesRes.data as any[]) || [];
        const discountsList = (discountsRes.data as any[]) || [];

        setCounts({
          orders: ordersList.length,
          pendingOrders: pendingCount,
          products: productsList.length,
          branches: branchesList.length,
          discounts: discountsList.length,
        });
      } catch (err) {
        console.error('Failed to load counts:', err);
      }
    }

    loadCounts();
  }, [tab]);

  const navItems: TabItem[] = [
    {
      id: 'analytics',
      label: 'Overview & Metrics',
      description: 'Performance overview, revenue charts, and key business indicators',
      icon: BarChart3,
      section: 'analytics',
    },
    {
      id: 'orders',
      label: 'Orders',
      description: '4-stage fulfillment pipeline: 1. Order → 2. Ready to Ship → 3. Shipped → 4. Delivered',
      icon: ClipboardList,
      section: 'commerce',
      badge: counts.pendingOrders > 0 ? `${counts.pendingOrders} pending` : counts.orders,
    },
    {
      id: 'products',
      label: 'Products & Inventory',
      description: 'Catalog items, inventory count, colorways, and sizes',
      icon: Package,
      section: 'commerce',
      badge: counts.products > 0 ? counts.products : undefined,
    },
    {
      id: 'branches',
      label: 'Branches & Locations',
      description: 'Physical KINGWEAR stores, Google Maps pins, addresses, and hours',
      icon: MapPin,
      section: 'stores',
      badge: counts.branches > 0 ? counts.branches : undefined,
    },
    {
      id: 'customers',
      label: 'Customers',
      description: 'Customer contact records, order histories, and lifetime spend',
      icon: Users,
      section: 'commerce',
    },
    {
      id: 'lookbook',
      label: 'Lookbook Gallery',
      description: 'Curate marketing editorial photos and showcase styles',
      icon: Camera,
      section: 'content',
    },
    {
      id: 'discounts',
      label: 'Discounts & Coupons',
      description: 'Create promotional voucher codes and seasonal discounts',
      icon: Tag,
      section: 'content',
      badge: counts.discounts > 0 ? counts.discounts : undefined,
    },
    {
      id: 'settings',
      label: 'Shop Settings',
      description: 'Store policies, shipping thresholds, tax rates, and contact info',
      icon: Settings,
      section: 'config',
    },
  ];

  const currentItem = navItems.find((n) => n.id === tab) || navItems[0];

  const sections = [
    { key: 'analytics', title: 'INSIGHTS' },
    { key: 'commerce', title: 'COMMERCE' },
    { key: 'stores', title: 'LOCATIONS' },
    { key: 'content', title: 'STOREFRONT' },
    { key: 'config', title: 'SYSTEM' },
  ];

  const selectTab = (t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-50 antialiased">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-ink-900/95 backdrop-blur-xl transition-all duration-300 lg:static lg:z-auto ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand / Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            {(!sidebarCollapsed || sidebarOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-display text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  KINGWEAR
                  <span className="rounded-full bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-400">
                    ADMIN
                  </span>
                </span>
                <span className="text-[11px] text-ink-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Store Active
                </span>
              </div>
            )}
          </div>

          {/* Close for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse toggle for desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-white lg:flex"
          >
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar space-y-6">
          {sections.map((sec) => {
            const sectionItems = navItems.filter((item) => item.section === sec.key);
            if (sectionItems.length === 0) return null;

            return (
              <div key={sec.key} className="space-y-1">
                {(!sidebarCollapsed || sidebarOpen) && (
                  <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    {sec.title}
                  </div>
                )}
                {sectionItems.map((item) => {
                  const isActive = tab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      title={sidebarCollapsed && !sidebarOpen ? item.label : undefined}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                          : 'text-ink-400 hover:bg-white/5 hover:text-white'
                      } ${sidebarCollapsed && !sidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-ink-400 group-hover:text-white'
                        }`}
                      />

                      {(!sidebarCollapsed || sidebarOpen) && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : typeof item.badge === 'string' && item.badge.includes('pending')
                                  ? 'bg-warning-500/20 text-warning-400'
                                  : 'bg-white/10 text-ink-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && !sidebarOpen && isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-1 h-5 rounded-l bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer User Info & Actions */}
        <div className="border-t border-white/10 p-3 space-y-2">
          {(!sidebarCollapsed || sidebarOpen) && (
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.email || 'Store Administrator'}
                </p>
                <p className="text-[11px] text-ink-400">Master Admin</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <button
              onClick={onBack}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white ${
                sidebarCollapsed && !sidebarOpen ? 'justify-center px-0' : ''
              }`}
              title="View Storefront"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-brand-400" />
              {(!sidebarCollapsed || sidebarOpen) && <span>Live Storefront</span>}
            </button>

            <button
              onClick={signOut}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-error-400 transition-colors hover:bg-error-500/10 hover:text-error-300 ${
                sidebarCollapsed && !sidebarOpen ? 'justify-center px-0' : ''
              }`}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {(!sidebarCollapsed || sidebarOpen) && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-ink-950/80 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-ink-900 text-ink-300 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-sm">
              <span
                className="font-semibold text-ink-400 hover:text-white transition-colors cursor-pointer"
                onClick={() => setTab('analytics')}
              >
                KINGWEAR Admin
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-ink-600" />
              <span className="font-semibold text-white">{currentItem.label}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5 text-brand-400" />
              View Storefront
            </button>

            <button
              onClick={signOut}
              className="flex h-8 w-8 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-ink-300 transition-colors hover:bg-error-500/20 hover:border-error-500/30 hover:text-error-400"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 max-w-7xl w-full mx-auto">
          {/* Section Header Card */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {currentItem.label}
                </h1>
                {currentItem.badge !== undefined && (
                  <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-semibold text-brand-400 border border-brand-500/30">
                    {currentItem.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-400 max-w-2xl">{currentItem.description}</p>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-900/80 px-3 py-1 text-xs text-ink-400">
                <Sparkles className="h-3 w-3 text-brand-400" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Active Tab Component */}
          <div className="animate-fade-in">
            {tab === 'analytics' && <AdminAnalytics />}
            {tab === 'orders' && <AdminOrders />}
            {tab === 'products' && <AdminProducts />}
            {tab === 'branches' && <AdminBranches />}
            {tab === 'customers' && <AdminCustomers />}
            {tab === 'lookbook' && <AdminLookbook />}
            {tab === 'discounts' && <AdminDiscounts />}
            {tab === 'settings' && <AdminSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
