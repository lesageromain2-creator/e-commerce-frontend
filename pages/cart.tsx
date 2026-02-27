/**
 * Panier - Atelier Vintage
 * Refined Versatility
 */

import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'react-toastify';
import { EcommerceLayout } from '@/components/ecommerce';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal, getItemCount, isLoading, syncWithBackend } = useCartStore();

  useEffect(() => {
    syncWithBackend();
  }, []);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = (subtotal + shipping) * 0.2;
  const total = subtotal + shipping + tax;

  const handleUpdate = async (itemId: string, qty: number) => {
    try {
      await updateQuantity(itemId, qty);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };
  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.success('Article retiré');
    } catch {
      toast.error('Erreur');
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Head><title>Panier | Atelier Vintage</title></Head>
        <EcommerceLayout>
          <div className="max-w-grid mx-auto px-6 lg:px-20 py-24 text-center">
            <h1 className="font-heading text-h1 text-charcoal mb-4">Votre panier est vide</h1>
            <p className="text-charcoal/70 mb-8">Ajoutez des pièces pour commencer.</p>
            <Link href="/products" className="btn-primary">Découvrir la boutique</Link>
          </div>
        </EcommerceLayout>
      </>
    );
  }

  return (
    <>
      <Head><title>Panier ({getItemCount()}) | Atelier Vintage</title></Head>
      <EcommerceLayout>
        <div className="max-w-grid mx-auto px-6 lg:px-20 py-12 lg:py-16">
          <h1 className="font-heading text-h1 text-charcoal mb-2">Panier</h1>
          <p className="text-charcoal/70 mb-10">{getItemCount()} article{getItemCount() > 1 ? 's' : ''}</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="border border-pearl rounded-refined divide-y divide-pearl bg-offwhite overflow-hidden">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 flex flex-col sm:flex-row gap-4"
                  >
                    <Link href={`/products/${item.slug}`} className="flex-shrink-0 w-full sm:w-28 h-36 sm:h-28 rounded-refined overflow-hidden bg-pearl/30">
                      <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`} className="font-heading text-lg text-charcoal hover:text-gold transition-colors">
                        {item.name}
                      </Link>
                      {item.variantName && <p className="text-small text-charcoal/60 mt-1">{item.variantName}</p>}
                      <p className="text-caption text-charcoal/50 mt-1">SKU : {item.sku}</p>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-caption text-charcoal/60 hover:text-charcoal mt-2"
                      >
                        Retirer
                      </button>
                    </div>
                    <div className="flex sm:flex-col sm:items-end justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(item.id, Math.max(1, item.quantity - 1))}
                          disabled={isLoading}
                          className="w-9 h-9 border border-pearl rounded-refined hover:border-gold text-charcoal disabled:opacity-50"
                        >−</button>
                        <span className="w-10 text-center text-small font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdate(item.id, Math.min(item.maxStock, item.quantity + 1))}
                          disabled={isLoading || item.quantity >= item.maxStock}
                          className="w-9 h-9 border border-pearl rounded-refined hover:border-gold text-charcoal disabled:opacity-50"
                        >+</button>
                      </div>
                      <p className="font-medium text-charcoal">{item.price.toFixed(2)} €</p>
                      <p className="text-small text-charcoal/70">Total : {(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link href="/products" className="inline-flex items-center gap-2 mt-6 text-small text-gold hover:underline">
                ← Continuer mes achats
              </Link>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 border border-pearl rounded-refined bg-pearl/20 p-6">
                <h2 className="font-heading text-h2 text-charcoal mb-6">Résumé</h2>
                <div className="space-y-3 text-small">
                  <div className="flex justify-between"><span className="text-charcoal/70">Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
                  <div className="flex justify-between"><span className="text-charcoal/70">Livraison</span><span>{shipping === 0 ? <span className="text-sage">Gratuite</span> : `${shipping.toFixed(2)} €`}</span></div>
                  {subtotal > 0 && subtotal < 50 && <p className="text-caption text-gold">Plus que {(50 - subtotal).toFixed(2)} € pour la livraison gratuite</p>}
                  <div className="flex justify-between"><span className="text-charcoal/70">TVA 20%</span><span>{tax.toFixed(2)} €</span></div>
                </div>
                <div className="border-t border-pearl mt-4 pt-4 flex justify-between font-body font-semibold text-lg">
                  <span>Total</span><span>{total.toFixed(2)} €</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="btn-primary w-full mt-6"
                >
                  Procéder au paiement
                </button>
                <p className="text-caption text-charcoal/50 text-center mt-4">Paiement sécurisé · Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </EcommerceLayout>
    </>
  );
}
