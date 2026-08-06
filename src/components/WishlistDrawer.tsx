import { useState } from 'react';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import type { Product } from '@/lib/types';

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
  onQuickView: (product: Product) => void;
}

export default function WishlistDrawer({ open, onClose, onQuickView }: WishlistDrawerProps) {
  const { items, remove, clear } = useWishlist();
  const { open: openCart } = useCart();
  const { format } = useCurrency();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="animate-slide-in-right relative ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" fill="currentColor" />
            <h2 className="font-display text-xl font-bold text-white">Wishlist</h2>
            {items.length > 0 && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                {items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clear}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-white"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Heart className="h-10 w-10 text-ink-600" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">Your wishlist is empty</p>
              <p className="mt-1 text-sm text-ink-400">
                Heart products you love to save them here.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-400"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((product) => (
              <WishlistItem
                key={product.id}
                product={product}
                format={format}
                onRemove={() => remove(product.id)}
                onMoveToCart={() => {
                  onQuickView(product);
                  onClose();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WishlistItem({
  product,
  format,
  onRemove,
  onMoveToCart,
}: {
  product: Product;
  format: (p: number) => string;
  onRemove: () => void;
  onMoveToCart: () => void;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/8 bg-ink-900/60 p-3">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{product.category}</p>
          <p className="mt-0.5 truncate font-display text-base font-bold text-white">{product.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-brand-400">{format(product.price)}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onMoveToCart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-400"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
          </button>
          <button
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-ink-400 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
