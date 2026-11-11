import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/catalog';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  quantityOf: (productId: string) => number;
  count: () => number;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (product) =>
        set((s) => {
          const existing = s.lines.find((l) => l.product.id === product.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.product.id === product.id
                  ? { ...l, quantity: Math.min(l.quantity + 1, product.stock_quantity) }
                  : l,
              ),
            };
          }
          return { lines: [...s.lines, { product, quantity: 1 }] };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.product.id !== productId)
              : s.lines.map((l) =>
                  l.product.id === productId
                    ? { ...l, quantity: Math.min(quantity, l.product.stock_quantity) }
                    : l,
                ),
        })),
      remove: (productId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.product.id !== productId) })),
      clear: () => set({ lines: [] }),
      quantityOf: (productId) => get().lines.find((l) => l.product.id === productId)?.quantity ?? 0,
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      total: () => get().lines.reduce((n, l) => n + l.quantity * Number(l.product.price), 0),
    }),
    { name: 'campuskart-cart' },
  ),
);
