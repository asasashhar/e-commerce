import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Product } from '@/lib/types';

type WishlistState = { items: Product[] };

type WishlistAction =
  | { type: 'TOGGLE'; product: Product }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

const LS_KEY = 'stride_wishlist';

function loadInitial(): WishlistState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as WishlistState) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.items.some((p) => p.id === action.product.id);
      return {
        items: exists
          ? state.items.filter((p) => p.id !== action.product.id)
          : [...state.items, action.product],
      };
    }
    case 'REMOVE':
      return { items: state.items.filter((p) => p.id !== action.id) };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

interface WishlistContextValue {
  items: Product[];
  count: number;
  isWishlisted: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items: state.items,
      count: state.items.length,
      isWishlisted: (id) => state.items.some((p) => p.id === id),
      toggle: (product) => dispatch({ type: 'TOGGLE', product }),
      remove: (id) => dispatch({ type: 'REMOVE', id }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }),
    [state]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
