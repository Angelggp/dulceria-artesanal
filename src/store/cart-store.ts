import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  lastAdded: string | null;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearLastAdded: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastAdded: null,
      addToCart: (product) => {
        const existing = get().items.find((item) => item.product.id === product.id);
        if (existing) {
          if (existing.quantity >= product.stock) return;
          set({
            items: get().items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            lastAdded: product.name,
          });
        } else {
          if (product.stock === 0) return;
          set({ items: [...get().items, { product, quantity: 1 }], lastAdded: product.name });
        }
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.product.id !== productId) });
        } else {
          set({
            items: get().items.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: Math.min(quantity, item.product.stock) }
                : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      clearLastAdded: () => set({ lastAdded: null }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    }),
    {
      name: "dulceria_cart_zustand_v2",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
