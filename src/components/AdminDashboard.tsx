import { useState } from 'react';
import { LogOut, Package, ClipboardList, Tag, Settings, BarChart3, Users, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminDiscounts from './AdminDiscounts';
import AdminSettings from './AdminSettings';
import AdminAnalytics from './AdminAnalytics';
import AdminCustomers from './AdminCustomers';
import AdminLookbook from './AdminLookbook';

type Tab = 'orders' | 'products' | 'discounts' | 'analytics' | 'customers' | 'settings' | 'lookbook';

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'analytics',  label: 'Analytics',  icon: BarChart3     },
  { id: 'orders',     label: 'Orders',     icon: ClipboardList },
  { id: 'products',   label: 'Products',   icon: Package       },
  { id: 'customers',  label: 'Customers',  icon: Users         },
  { id: 'discounts',  label: 'Discounts',  icon: Tag           },
  { id: 'lookbook',   label: 'Lookbook',   icon: Camera        },
  { id: 'settings',   label: 'Settings',   icon: Settings      },
];

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('analytics');

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-ink-400">
              Signed in as <span className="text-ink-200">{user?.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onBack} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
              View Store
            </button>
            <button onClick={signOut} className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-error-500/20 hover:text-error-500">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              id={`admin-tab-${t.id}`}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                tab === t.id
                  ? 'bg-white text-ink-950'
                  : 'border border-white/10 text-ink-300 hover:border-white/30 hover:text-white'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.id === 'lookbook' && (
                <span className="ml-1 rounded-full bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">NEW</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6 animate-fade-in">
          {tab === 'analytics'  && <AdminAnalytics />}
          {tab === 'orders'     && <AdminOrders />}
          {tab === 'products'   && <AdminProducts />}
          {tab === 'customers'  && <AdminCustomers />}
          {tab === 'discounts'  && <AdminDiscounts />}
          {tab === 'lookbook'   && <AdminLookbook />}
          {tab === 'settings'   && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
