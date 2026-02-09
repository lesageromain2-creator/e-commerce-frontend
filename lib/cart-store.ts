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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
        
        try {
          const sessionId = get().sessionId || crypto.randomUUID();
          
          // Appel API
          const response = await axios.post(
            `${API_URL}/cart/items`,
            {
              productId: newItem.productId,
              variantId: newItem.variantId,
              quantity: newItem.quantity,
            },
            {
              headers: {
                'X-Session-Id': sessionId,
              },
            }
          );

          // Mettre à jour le state avec la réponse du backend
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
              sessionId: response.data.cart.sessionId,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Error adding to cart:', error);
          set({
            error: error.response?.data?.message || 'Erreur lors de l\'ajout au panier',
            isLoading: false,
          });
          
          // En cas d'erreur, ajout local uniquement
          const existing = get().items.find(
            (item) =>
              item.productId === newItem.productId &&
              item.variantId === newItem.variantId
          );

          if (existing) {
            set({
              items: get().items.map((item) =>
                item.id === existing.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            });
          } else {
            set({
              items: [
                ...get().items,
                {
                  ...newItem,
                  id: crypto.randomUUID(),
                },
              ],
            });
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

      // Synchroniser avec le backend
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
          }
        } catch (error: any) {
          console.error('Error syncing cart:', error);
          set({
            error: error.response?.data?.message || 'Erreur lors de la synchronisation',
            isLoading: false,
          });
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

  // Synchroniser au montage
  React.useEffect(() => {
    store.syncWithBackend();
  }, []);

  return store;
}

// Export React pour l'import
import React from 'react';
