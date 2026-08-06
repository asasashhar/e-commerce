import { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isOpen, close, remove, updateQty, subtotal, count } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[56] flex h-full w-full max-w-md flex-col bg-ink-900 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-400" />
            <h2 className="font-display text-lg font-bold text-white">
              Your Cart {count > 0 && <span className="text-ink-400">({count})</span>}
            </h2>
          </div>
          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <ShoppingBag className="h-8 w-8 text-ink-500" />
            </div>
            <p className="text-lg font-semibold text-white">Your cart is empty</p>
            <p className="text-sm text-ink-400">Add some shoes to get started.</p>
            <button
              onClick={close}
              className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-105"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {items.map((item, i) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color.name}`}
                  className="flex gap-3 rounded-2xl border border-white/8 bg-ink-800/50 p-3 animate-fade-in"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{item.product.name}</h3>
                        <p className="text-xs text-ink-400">
                          Size {item.size} · {item.color.name}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(i)}
                        className="text-ink-500 transition-colors hover:text-error-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border border-white/10">
                        <button
                          onClick={() => updateQty(i, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-ink-300 transition-colors hover:text-white"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(i, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-ink-300 transition-colors hover:text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display font-bold text-white">
                        {format(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400">Subtotal</span>
              <span className="font-display text-2xl font-bold text-white">
                {format(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-500">Shipping & taxes calculated at checkout.</p>
            <button
              onClick={onCheckout}
              className="mt-4 w-full rounded-full bg-brand-500 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-brand-400 active:scale-95"
            >
              Checkout · {format(subtotal)}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
