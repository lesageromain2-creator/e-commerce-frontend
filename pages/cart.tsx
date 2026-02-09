/**
 * Page Panier E-commerce
 * /cart
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'react-toastify';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemCount,
    isLoading,
    syncWithBackend,
  } = useCartStore();

  useEffect(() => {
    syncWithBackend();
  }, []);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = (subtotal + shipping) * 0.20; // TVA 20%
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.success('Produit retiré du panier');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Panier vide | VotreShop</title>
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-6">
              Ajoutez des produits pour commencer vos achats
            </p>
            <Link href="/products">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
                Découvrir nos produits
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Panier ({getItemCount()}) | VotreShop</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              Mon Panier
            </h1>
            <p className="text-lg opacity-90 mt-2">
              {getItemCount()} article{getItemCount() > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des produits */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                {/* Header du tableau */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b font-medium text-sm text-gray-600">
                  <div className="col-span-6">Produit</div>
                  <div className="col-span-2 text-center">Prix</div>
                  <div className="col-span-2 text-center">Quantité</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Items */}
                <div className="divide-y">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Produit */}
                        <div className="md:col-span-6 flex gap-4">
                          <Link href={`/products/${item.slug}`}>
                            <img
                              src={item.image || '/placeholder.png'}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link href={`/products/${item.slug}`}>
                              <h3 className="font-semibold hover:text-blue-600 cursor-pointer transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            {item.variantName && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.variantName}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              SKU: {item.sku}
                            </p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 text-sm hover:underline mt-2"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>

                        {/* Prix */}
                        <div className="md:col-span-2 flex items-center md:justify-center">
                          <span className="md:hidden font-medium mr-2">Prix :</span>
                          <span className="font-semibold">{item.price.toFixed(2)}€</span>
                        </div>

                        {/* Quantité */}
                        <div className="md:col-span-2 flex items-center md:justify-center gap-2">
                          <span className="md:hidden font-medium mr-2">Quantité :</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 font-bold"
                            disabled={isLoading}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.id,
                                Math.max(1, Math.min(item.maxStock, parseInt(e.target.value) || 1))
                              )
                            }
                            min="1"
                            max={item.maxStock}
                            className="w-16 text-center border border-gray-300 rounded py-1"
                            disabled={isLoading}
                          />
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                Math.min(item.maxStock, item.quantity + 1)
                              )
                            }
                            className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 font-bold"
                            disabled={isLoading || item.quantity >= item.maxStock}
                          >
                            +
                          </button>
                        </div>

                        {/* Total */}
                        <div className="md:col-span-2 flex items-center md:justify-end">
                          <span className="md:hidden font-medium mr-2">Total :</span>
                          <span className="font-bold text-lg">
                            {(item.price * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Continuer les achats */}
              <Link href="/products">
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continuer mes achats
                </button>
              </Link>
            </div>

            {/* Résumé de la commande */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Résumé</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Gratuite</span>
                      ) : (
                        `${shipping.toFixed(2)}€`
                      )}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal < 50 && (
                    <p className="text-xs text-gray-500">
                      Plus que {(50 - subtotal).toFixed(2)}€ pour la livraison gratuite !
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (20%)</span>
                    <span className="font-medium">{tax.toFixed(2)}€</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-2xl">{total.toFixed(2)}€</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all mb-3"
                >
                  Procéder au paiement
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Paiement sécurisé avec Stripe
                </p>

                {/* Badges de confiance */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <span>Livraison gratuite dès 50€</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>Retours gratuits 30 jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
