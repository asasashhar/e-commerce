import { useEffect, useState } from 'react';
import { ShoppingBag, Menu, X, ShieldCheck, Truck, Heart, Camera, Globe } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency, CURRENCIES, type CurrencyCode } from '@/context/CurrencyContext';

const LINKS = [
  { label: 'Shop', href: '#shop' },
  { label: 'Lookbook', href: '#lookbook', isRoute: true },
  { label: 'About', href: '#about' },
];

interface NavbarProps {
  onAdmin?: () => void;
  onTrack?: () => void;
  onLookbook?: () => void;
  onWishlist?: () => void;
}

export default function Navbar({ onAdmin, onTrack, onLookbook, onWishlist }: NavbarProps) {
  const { count, toggle } = useCart();
  const { count: wishCount } = useWishlist();
  const { currency, setCurrency } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close currency dropdown on outside click
  useEffect(() => {
    if (!showCurrency) return;
    const close = () => setShowCurrency(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showCurrency]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass py-3 shadow-lg shadow-black/20' : 'py-5 bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            STRIDE
          </span>
          <span className="h-2 w-2 rounded-full bg-brand-500 transition-transform duration-300 group-hover:scale-150" />
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#shop"
            className="relative text-sm font-medium text-ink-300 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-brand-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            Shop
          </a>
          {onLookbook && (
            <button
              onClick={onLookbook}
              className="flex items-center gap-1 relative text-sm font-medium text-ink-300 transition-colors hover:text-white"
            >
              <Camera className="h-3.5 w-3.5" /> Lookbook
            </button>
          )}
          {onTrack && (
            <button
              onClick={onTrack}
              className="flex items-center gap-1.5 text-sm font-medium text-ink-300 transition-colors hover:text-white"
            >
              <Truck className="h-3.5 w-3.5" /> Track Order
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Currency switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={(e) => { e.stopPropagation(); setShowCurrency((v) => !v); }}
              className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-2 text-sm font-medium text-ink-300 transition-all hover:bg-white/15 hover:text-white"
              id="currency-switcher-btn"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{currency.code}</span>
            </button>
            {showCurrency && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-52 animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl"
              >
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code as CurrencyCode); setShowCurrency(false); }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 ${
                      currency.code === c.code ? 'text-brand-400 bg-brand-500/10' : 'text-ink-300'
                    }`}
                  >
                    <span className="font-bold text-base">{c.symbol}</span>
                    <div>
                      <p className="font-medium text-white">{c.code}</p>
                      <p className="text-xs text-ink-500">{c.label.split(' — ')[1]}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {onAdmin && (
            <button
              onClick={onAdmin}
              className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-2 text-sm font-medium text-ink-300 transition-all duration-300 hover:bg-white/15 hover:text-white"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Wishlist */}
          {onWishlist && (
            <button
              onClick={onWishlist}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95"
              aria-label="Wishlist"
              id="wishlist-nav-btn"
            >
              <Heart className="h-4 w-4" />
              {wishCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white animate-scale-in">
                  {wishCount}
                </span>
              )}
            </button>
          )}

          {/* Cart */}
          <button
            onClick={toggle}
            className="relative flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95"
            id="cart-nav-btn"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white animate-scale-in">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-5 mt-3 animate-fade-in rounded-2xl glass p-4 md:hidden">
          <a
            href="#shop"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-base font-medium text-ink-200 transition-colors hover:text-white"
          >
            Shop
          </a>
          {onLookbook && (
            <button
              onClick={() => { onLookbook(); setMobileOpen(false); }}
              className="flex w-full items-center gap-2 py-3 text-base font-medium text-ink-200 transition-colors hover:text-white"
            >
              <Camera className="h-4 w-4" /> Lookbook
            </button>
          )}
          {onTrack && (
            <button
              onClick={() => { onTrack(); setMobileOpen(false); }}
              className="flex w-full items-center gap-2 py-3 text-base font-medium text-ink-200 transition-colors hover:text-white"
            >
              <Truck className="h-4 w-4" /> Track Order
            </button>
          )}
          {onAdmin && (
            <button
              onClick={() => { onAdmin(); setMobileOpen(false); }}
              className="flex w-full items-center gap-2 py-3 text-base font-medium text-ink-200 transition-colors hover:text-white"
            >
              <ShieldCheck className="h-4 w-4" /> Admin Panel
            </button>
          )}
          {/* Mobile currency */}
          <div className="mt-2 border-t border-white/10 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Currency</p>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code as CurrencyCode)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                    currency.code === c.code
                      ? 'border-brand-500 bg-brand-500/15 text-white'
                      : 'border-white/10 text-ink-400 hover:text-white'
                  }`}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
