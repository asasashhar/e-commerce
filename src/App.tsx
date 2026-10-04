import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import ProductGrid from '@/components/ProductGrid';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import QuickView from '@/components/QuickView';
import CartDrawer from '@/components/CartDrawer';
import Checkout from '@/components/Checkout';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import OrderTracking from '@/components/OrderTracking';
import WhatsAppButton from '@/components/WhatsAppButton';
import WishlistDrawer from '@/components/WishlistDrawer';
import Lookbook from '@/components/Lookbook';
import PublicBranches from '@/components/PublicBranches';
import StoreBranchesSection from '@/components/StoreBranchesSection';

type Route = 'store' | 'admin' | 'track' | 'lookbook' | 'branches';

function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => {
    const hash = window.location.hash;
    if (hash === '#admin') return 'admin';
    if (hash === '#track') return 'track';
    if (hash === '#lookbook') return 'lookbook';
    if (hash === '#branches') return 'branches';
    return 'store';
  });

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash;
      if (h === '#admin') setRoute('admin');
      else if (h === '#track') setRoute('track');
      else if (h === '#lookbook') setRoute('lookbook');
      else if (h === '#branches') setRoute('branches');
      else setRoute('store');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (r: Route) => {
    window.location.hash = r === 'store' ? '' : r;
    setRoute(r);
  };

  return [route, navigate];
}

function AdminRoute({ onBack }: { onBack: () => void }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return user ? <AdminDashboard onBack={onBack} /> : <AdminLogin onBack={onBack} />;
}

function Store() {
  const [route, navigate] = useRoute();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) {
        setError(queryError.message);
      } else if (data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    })();
  }, []);

  if (route === 'admin') {
    return <AdminRoute onBack={() => navigate('store')} />;
  }

  if (route === 'track') {
    return <OrderTracking onBack={() => navigate('store')} />;
  }

  if (route === 'lookbook') {
    return <Lookbook onBack={() => navigate('store')} />;
  }

  if (route === 'branches') {
    return <PublicBranches onBack={() => navigate('store')} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <p className="font-display text-xl font-bold text-white">Something went wrong</p>
          <p className="mt-2 text-sm text-ink-400">{error}</p>
        </div>
      </div>
    );
  }

  const featured = products.filter((p) => p.featured);

  return (
    <>
      <Navbar
        onAdmin={() => navigate('admin')}
        onTrack={() => navigate('track')}
        onLookbook={() => navigate('lookbook')}
        onBranches={() => navigate('branches')}
        onWishlist={() => setWishlistOpen(true)}
      />
      <main>
        <Hero
          featured={featured.length ? featured : products}
          onShop={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
        />
        <Marquee />
        <ProductGrid products={products} onQuickView={setQuickView} />
        <StoreBranchesSection onExplore={() => navigate('branches')} />
        <Features />
      </main>
      <Footer
        onAdmin={() => navigate('admin')}
        onTrack={() => navigate('track')}
        onBranches={() => navigate('branches')}
      />

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <Checkout open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onQuickView={setQuickView}
      />
      <WhatsAppButton />
    </>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Store />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}
