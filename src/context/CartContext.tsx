import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { CartItem, Product, ProductColor } from '@/lib/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD'; product: Product; size: string; color: ProductColor }
  | { type: 'REMOVE'; index: number }
  | { type: 'UPDATE_QTY'; index: number; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE' };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.findIndex(
        (item) =>
          item.product.id === action.product.id &&
          item.size === action.size &&
          item.color.name === action.color.name
      );
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = { ...items[existing], quantity: items[existing].quantity + 1 };
        return { ...state, items, isOpen: true };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, size: action.size, color: action.color, quantity: 1 }],
        isOpen: true,
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((_, i) => i !== action.index) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((item, i) =>
          i === action.index ? { ...item, quantity: Math.max(1, action.quantity) } : item
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  add: (product: Product, size: string, color: ProductColor) => void;
  remove: (index: number) => void;
  updateQty: (index: number, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false });

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return {
      items: state.items,
      isOpen: state.isOpen,
      count,
      subtotal,
      add: (product, size, color) => dispatch({ type: 'ADD', product, size, color }),
      remove: (index) => dispatch({ type: 'REMOVE', index }),
      updateQty: (index, quantity) => dispatch({ type: 'UPDATE_QTY', index, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
      open: () => dispatch({ type: 'OPEN' }),
      close: () => dispatch({ type: 'CLOSE' }),
      toggle: () => dispatch({ type: 'TOGGLE' }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
