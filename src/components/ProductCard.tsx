import { useRef, useState } from 'react';
import { Star, Plus, Eye, Heart, Bell } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useReveal } from '@/hooks/useReveal';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import NotifyModal from './NotifyModal';

interface ProductCardProps {
  product: Product;
  index: number;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, index, onQuickView }: ProductCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [notifyOpen, setNotifyOpen] = useState(false);
  const { isWishlisted, toggle } = useWishlist();
  const { format } = useCurrency();
  const wishlisted = isWishlisted(product.id);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 16,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -16,
    });
  };

  const reset = () => setMousePos({ x: 0, y: 0 });

  return (
    <>
      <div
        ref={ref}
        className={`reveal ${visible ? 'is-visible' : ''}`}
        style={{ transitionDelay: `${(index % 4) * 100}ms` }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={reset}
          className="card-tilt group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-ink-800/60 to-ink-900/60"
          style={{ transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)` }}
        >
          {/* Badge */}
          {product.badge && (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-500/30">
              {product.badge}
            </span>
          )}

          {/* Out of stock overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                Out of Stock
              </span>
              <button
                onClick={() => setNotifyOpen(true)}
                className="mt-3 flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-400"
              >
                <Bell className="h-3.5 w-3.5" /> Notify Me
              </button>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(product);
            }}
            className={`absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
              wishlisted
                ? 'bg-red-500/20 text-red-400 opacity-100'
                : 'bg-white/10 text-white opacity-0 hover:bg-white/20 group-hover:opacity-100'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${wishlisted ? 'fill-red-400 scale-110' : ''}`} />
          </button>

          {/* Quick view button */}
          <button
            onClick={() => onQuickView(product)}
            className="absolute right-4 top-14 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-white/20 group-hover:opacity-100"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Image area */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 to-transparent" />
          </div>

          {/* Info */}
          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
                <span className="text-xs font-semibold text-ink-200">{product.rating}</span>
                <span className="text-xs text-ink-500">({product.reviews})</span>
              </div>
            </div>

            <h3 className="mt-2 font-display text-lg font-bold text-white">{product.name}</h3>

            {/* Color dots */}
            <div className="mt-2 flex items-center gap-1.5">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.name}
                  className="h-4 w-4 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-ink-500">+{product.colors.length - 4}</span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-display text-xl font-bold text-white">{format(product.price)}</span>
              {product.in_stock ? (
                <button
                  onClick={() => onQuickView(product)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white transition-all duration-300 hover:scale-110 hover:bg-brand-400 active:scale-95"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Plus className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={() => setNotifyOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ink-400 transition-all duration-300 hover:border-brand-500 hover:text-brand-400"
                  aria-label={`Notify me when ${product.name} is back in stock`}
                >
                  <Bell className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notify modal */}
      {notifyOpen && (
        <NotifyModal
          productId={product.id}
          productName={product.name}
          onClose={() => setNotifyOpen(false)}
        />
      )}
    </>
  );
}
