/**
 * Contact - Atelier Vintage
 * Page simple pour le lien footer
 */

import Head from 'next/head';
import { EcommerceLayout } from '@/components/ecommerce';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact | Atelier Vintage</title>
        <meta name="description" content="Contactez Atelier Vintage" />
      </Head>
      <EcommerceLayout>
        <div className="max-w-grid mx-auto px-6 lg:px-20 py-20">
          <h1 className="font-heading text-h1 text-charcoal mb-4">Contact</h1>
          <p className="text-charcoal/70 mb-8 max-w-xl">
            Une question sur une pièce ou votre commande ? Écrivez-nous.
          </p>
          <div className="border border-pearl rounded-refined bg-pearl/20 p-6 max-w-md">
            <p className="text-small text-charcoal/70">
              <strong className="text-charcoal">Email :</strong> contact@atelier-vintage.example.com
            </p>
            <p className="text-small text-charcoal/70 mt-2">
              <strong className="text-charcoal">Réponse sous 24–48 h.</strong>
            </p>
          </div>
        </div>
      </EcommerceLayout>
    </>
  );
}
