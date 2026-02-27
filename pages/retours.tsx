/**
 * Retours et remboursements - EcamSap
 */

import Link from 'next/link';
import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

export default function RetoursPage() {
  return (
    <StaticPageLayout
      title="Retours et remboursements"
      description="Conditions de retours et remboursements EcamSap."
    >
      <p className="mb-6">Nous acceptons les retours et remboursements sous les conditions suivantes.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Délai</h2>
      <p>Vous disposez de 14 jours à compter de la remise en main propre pour demander un échange ou un remboursement.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Conditions</h2>
      <p>L’article doit être retourné dans son état d’origine, non porté, non lavé, avec les étiquettes. Contactez-nous avant tout envoi à {ECAMSAP.contactEmail} pour obtenir les instructions et l’adresse de retour.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Remboursement</h2>
      <p>Le remboursement est effectué sous 14 jours après réception et contrôle de l’article, par le même moyen de paiement que celui utilisé pour l’achat.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Échange</h2>
      <p>Un échange contre un autre article ou une autre taille est possible sous réserve de disponibilité. Nous contacter pour organiser l’échange.</p>

      <p className="mt-8">
        <Link href="/contact" className="text-gold font-medium hover:underline">Nous contacter</Link>
      </p>
    </StaticPageLayout>
  );
}
