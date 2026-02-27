/**
 * Confirmation de commande - Atelier Vintage
 * Refined Versatility
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { EcommerceLayout } from '@/components/ecommerce';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { redirect_status } = router.query;
  const { clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (redirect_status === 'succeeded') {
      clearCart();
    }
    setLoading(false);
  }, [redirect_status]);

  if (loading) {
    return (
      <EcommerceLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </EcommerceLayout>
    );
  }

  if (redirect_status === 'failed') {
    return (
      <>
        <Head><title>Paiement échoué | Atelier Vintage</title></Head>
        <EcommerceLayout>
          <div className="max-w-grid mx-auto px-6 py-24 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-pearl rounded-refined bg-offwhite p-8 lg:p-10 max-w-lg w-full text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="font-heading text-h2 text-charcoal mb-3">Paiement échoué</h1>
              <p className="text-charcoal/70 mb-8">
                Votre paiement n&apos;a pas pu être traité. Réessayez ou choisissez un autre moyen de paiement.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/cart" className="btn-primary">Retour au panier</Link>
                <Link href="/products" className="btn-secondary">Continuer les achats</Link>
              </div>
            </motion.div>
          </div>
        </EcommerceLayout>
      </>
    );
  }

  return (
    <>
      <Head><title>Commande confirmée | Atelier Vintage</title></Head>
      <EcommerceLayout>
        <div className="max-w-grid mx-auto px-6 py-24 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-pearl rounded-refined bg-offwhite p-8 lg:p-10 max-w-2xl w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6 text-sage"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <div className="text-center mb-8">
              <h1 className="font-heading text-h1 text-charcoal mb-3">Commande confirmée</h1>
              <p className="text-charcoal/70">Merci pour votre achat. Nous avons bien reçu votre commande.</p>
            </div>
            <div className="bg-pearl/30 rounded-refined p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-small">
                <div>
                  <span className="text-charcoal/60">Statut</span>
                  <p className="font-medium text-sage">Payé</p>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="font-heading text-h3 text-charcoal mb-4">Prochaines étapes</h2>
              <ul className="space-y-3 text-small text-charcoal/80">
                <li className="flex gap-3"><span className="text-gold font-medium">1.</span> Vous recevrez un email de confirmation.</li>
                <li className="flex gap-3"><span className="text-gold font-medium">2.</span> Nous préparons votre colis.</li>
                <li className="flex gap-3"><span className="text-gold font-medium">3.</span> Expédition avec numéro de suivi.</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products" className="btn-primary flex-1 text-center">Continuer les achats</Link>
              <Link href="/cart" className="btn-secondary flex-1 text-center">Voir le panier</Link>
            </div>
            <p className="mt-6 pt-6 border-t border-pearl text-center text-caption text-charcoal/60">
              Besoin d&apos;aide ? <Link href="/contact" className="text-gold hover:underline">Contact</Link>
            </p>
          </motion.div>
        </div>
      </EcommerceLayout>
    </>
  );
}
