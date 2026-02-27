/**
 * Livraison et remise - EcamSap
 */

import Link from 'next/link';
import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

export default function ExpeditionPage() {
  return (
    <StaticPageLayout
      title="Livraison et remise"
      description={`${ECAMSAP.pickup}. Politique de livraison et remise en main propre.`}
    >
      <p className="text-lg text-charcoal/80 mb-6">{ECAMSAP.pickup}</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Remise en main propre</h2>
      <p>Nous ne proposons pas de livraison postale. Toutes les commandes sont remises en main propre sur Vieux Lyon ou la Presqu&apos;île. Après validation de la commande, nous vous indiquons le lieu précis et proposons un créneau.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Délais</h2>
      <p>La commande est préparée sous 2 à 5 jours ouvrés. La remise est organisée ensuite selon nos disponibilités et les vôtres.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Frais</h2>
      <p>Remise en main propre sans frais supplémentaires.</p>

      <p className="mt-8">
        <Link href="/ou-trouver" className="text-gold font-medium hover:underline">Voir les points de remise</Link>
      </p>
    </StaticPageLayout>
  );
}
