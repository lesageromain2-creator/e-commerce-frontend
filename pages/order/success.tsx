/**
 * Page de confirmation de commande
 * /order/success
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { payment_intent, payment_intent_client_secret, redirect_status } = router.query;
  const { clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vider le panier après confirmation
    if (redirect_status === 'succeeded') {
      clearCart();
      setLoading(false);
    } else if (redirect_status === 'failed') {
      setLoading(false);
    }
  }, [redirect_status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (redirect_status === 'failed') {
    return (
      <>
        <Head>
          <title>Paiement échoué | VotreShop</title>
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Paiement échoué
            </h1>
            <p className="text-gray-600 mb-6">
              Votre paiement n'a pas pu être traité. Veuillez réessayer ou utiliser un autre moyen de paiement.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cart">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
                  Retour au panier
                </button>
              </Link>
              <Link href="/products">
                <button className="border-2 border-gray-300 px-6 py-3 rounded-lg font-bold hover:border-gray-400 transition-all">
                  Continuer les achats
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Commande confirmée | VotreShop</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full"
        >
          {/* Icon de succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          {/* Message de confirmation */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Commande confirmée !
            </h1>
            <p className="text-lg text-gray-600">
              Merci pour votre achat. Nous avons bien reçu votre commande.
            </p>
          </div>

          {/* Informations de la commande */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {payment_intent && (
                <div>
                  <span className="text-gray-500">Numéro de transaction :</span>
                  <p className="font-medium text-gray-900 break-all">
                    {payment_intent}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Statut :</span>
                <p className="font-medium text-green-600">Payé</p>
              </div>
            </div>
          </div>

          {/* Ce qui se passe maintenant */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Prochaines étapes</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Email de confirmation</p>
                  <p className="text-sm text-gray-600">
                    Vous allez recevoir un email de confirmation avec les détails de votre commande.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Préparation</p>
                  <p className="text-sm text-gray-600">
                    Nous préparons votre commande avec soin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Expédition</p>
                  <p className="text-sm text-gray-600">
                    Vous recevrez un email avec le numéro de suivi dès l'expédition.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/account/orders" className="flex-1">
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
                Voir mes commandes
              </button>
            </Link>
            <Link href="/products" className="flex-1">
              <button className="w-full border-2 border-gray-300 px-6 py-3 rounded-lg font-bold hover:border-gray-400 transition-all">
                Continuer les achats
              </button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
            <p>
              Besoin d'aide ?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contactez-nous
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
