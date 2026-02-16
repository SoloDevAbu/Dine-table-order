import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@shared/schema';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  uniqueId: string; // To differentiate same item with different notes
}

interface CartState {
  items: CartItem[];
  addToCart: (item: MenuItem, quantity: number, notes?: string) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addToCart: (menuItem, quantity, notes) => {
        const uniqueId = `${menuItem.id}-${Date.now()}`;
        set((state) => ({
          items: [...state.items, { menuItem, quantity, notes, uniqueId }],
        }));
      },
      removeFromCart: (uniqueId) => {
        set((state) => ({
          items: state.items.filter((item) => item.uniqueId !== uniqueId),
        }));
      },
      updateQuantity: (uniqueId, delta) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.uniqueId === uniqueId) {
              const newQty = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQty };
            }
            return item;
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'restaurant-cart',
    }
  )
);
