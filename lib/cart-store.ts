/**
 * Store Zustand - Gestion du panier e-commerce
 * Synchronisé avec localStorage et backend
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  maxStock: number;
}

interface CartStore {
  // État
  items: CartItem[];
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  
  // Calculés
  getTotal: () => number;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const API_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  : 'http://localhost:5000';

const API_TIMEOUT = 8000;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: null,
      isLoading: false,
      error: null,

      // Ajouter un produit au panier
      addItem: async (newItem) => {
        set({ isLoading: true, error: null });
        const sessionId = get().sessionId || crypto.randomUUID();

        const addLocally = () => {
          const existing = get().items.find(
            (item) =>
              item.productId === newItem.productId &&
              (item.variantId === newItem.variantId || (!item.variantId && !newItem.variantId))
          );
          if (existing) {
            set({
              items: get().items.map((item) =>
                item.id === existing.id
                  ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, newItem.maxStock || 99) }
                  : item
              ),
              isLoading: false,
              error: null,
            });
          } else {
            set({
              items: [
                ...get().items,
                { ...newItem, id: crypto.randomUUID() },
              ],
              sessionId,
              isLoading: false,
              error: null,
            });
          }
        };

        try {
          const response = await axios.post(
            `${API_URL}/cart/items`,
            {
              productId: newItem.productId,
              variantId: newItem.variantId || undefined,
              quantity: newItem.quantity,
            },
            {
              headers: { 'X-Session-Id': sessionId },
              timeout: API_TIMEOUT,
            }
          );

          if (response.data.success && response.data.cart?.items) {
            set({
              items: response.data.cart.items.map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                variantId: item.variant_id,
                name: item.product_name,
                variantName: item.variant_name,
                sku: item.sku,
                price: parseFloat(item.price_snapshot),
                quantity: item.quantity,
                image: item.images?.[0] || '',
                slug: item.slug,
                maxStock: item.variant_stock ?? item.stock_quantity ?? 99,
              })),
              sessionId: response.data.cart.sessionId ?? sessionId,
              isLoading: false,
              error: null,
            });
          } else {
            addLocally();
          }
        } catch (error: any) {
          const isNetworkError = !error.response || error.message === 'Network Error' || error.code === 'ECONNABORTED';
          if (isNetworkError) {
            console.warn('Cart API unreachable, adding item locally:', error.message);
            addLocally();
          } else {
            set({
              error: error.response?.data?.message || 'Erreur lors de l\'ajout au panier',
              isLoading: false,
            });
            addLocally();
          }
        }
      },

      // Mettre à jour la quantité
      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        
        try {
          const sessionId = get().sessionId;
          
          const response = await axios.patch(
            `${API_URL}/cart/items/${itemId}`,
            { quantity },
            {
              headers: {
                'X-Session-Id': sessionId,
              },
            }
          );

          if (response.data.success) {
            if (quantity === 0) {
              // Item supprimé
              set({
                items: get().items.filter((item) => item.id !== itemId),
                isLoading: false,
              });
            } else {
              // Quantité mise à jour
              set({
                items: get().items.map((item) =>
                  item.id === itemId ? { ...item, quantity } : item
                ),
                isLoading: false,
              });
            }
          }
        } catch (error: any) {
          console.error('Error updating quantity:', error);
          set({
            error: error.response?.data?.message || 'Erreur lors de la mise à jour',
            isLoading: false,
          });
          
          // Mise à jour locale en fallback
          if (quantity === 0) {
            set({
              items: get().items.filter((item) => item.id !== itemId),
            });
          } else {
            set({
              items: get().items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
              ),
            });
          }
        }
      },

      // Retirer un produit
      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        
        try {
          const sessionId = get().sessionId;
          
          await axios.delete(`${API_URL}/cart/items/${itemId}`, {
            headers: {
              'X-Session-Id': sessionId,
            },
          });

          set({
            items: get().items.filter((item) => item.id !== itemId),
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Error removing item:', error);
          set({
            error: error.response?.data?.message || 'Erreur lors de la suppression',
            isLoading: false,
          });
          
          // Suppression locale en fallback
          set({
            items: get().items.filter((item) => item.id !== itemId),
          });
        }
      },

      // Vider le panier
      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const sessionId = get().sessionId;
          
          await axios.delete(`${API_URL}/cart`, {
            headers: {
              'X-Session-Id': sessionId,
            },
          });

          set({
            items: [],
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Error clearing cart:', error);
          set({
            error: error.response?.data?.message || 'Erreur lors du vidage du panier',
            items: [], // On vide quand même localement
            isLoading: false,
          });
        }
      },

      // Synchroniser avec le backend (échoue silencieusement si backend injoignable, ex. retour depuis Stripe)
      syncWithBackend: async () => {
        set({ isLoading: true, error: null });

        try {
          const sessionId = get().sessionId;

          if (!sessionId) {
            set({ isLoading: false });
            return;
          }

          const response = await axios.get(`${API_URL}/cart`, {
            headers: {
              'X-Session-Id': sessionId,
            },
            timeout: API_TIMEOUT,
          });

          if (response.data.success) {
            set({
              items: response.data.cart.items.map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                variantId: item.variant_id,
                name: item.product_name,
                variantName: item.variant_name,
                sku: item.sku,
                price: parseFloat(item.price_snapshot),
                quantity: item.quantity,
                image: item.images?.[0] || '',
                slug: item.slug,
                maxStock: item.variant_stock || item.stock_quantity,
              })),
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          const isNetworkError =
            !error.response &&
            (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Network Error'));

          if (isNetworkError) {
            // Backend injoignable : on garde le panier local, pas d'erreur affichée
            set({ isLoading: false, error: null });
          } else {
            set({
              error: error.response?.data?.message || 'Erreur lors de la synchronisation',
              isLoading: false,
            });
          }
        }
      },

      // Calculer le total
      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      // Compter les items
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Calculer le sous-total
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        sessionId: state.sessionId,
      }),
    }
  )
);

// Hook pour utiliser le panier avec synchronisation auto
export function useCart() {
  const store = useCartStore();

  // Synchroniser au montage (ne pas faire remonter d'erreur si le backend est injoignable)
  React.useEffect(() => {
    store.syncWithBackend().catch(() => {});
  }, []);

  return store;
}

// Export React pour l'import
import React from 'react';
