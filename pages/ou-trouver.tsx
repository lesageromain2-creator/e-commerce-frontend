/**
 * Où récupérer ma commande - EcamSap
 */

import Link from 'next/link';
import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

export default function OuTrouverPage() {
  return (
    <StaticPageLayout
      title="Où récupérer ma commande"
      description={`${ECAMSAP.pickup}. Points de remise EcamSap à Lyon.`}
    >
      <p className="text-lg text-charcoal/80 mb-6">{ECAMSAP.pickup}</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Points de remise</h2>
      <ul className="space-y-6">
        <li className="pl-4 border-l-2 border-gold/50">
          <strong className="text-charcoal">Vieux Lyon</strong>
          <p className="text-charcoal/70 mt-1">Quartier Vieux Lyon (69005). Lieu exact communiqué après validation de la commande.</p>
          <p className="text-small text-charcoal/60 mt-1">Sur rendez-vous</p>
        </li>
        <li className="pl-4 border-l-2 border-gold/50">
          <strong className="text-charcoal">Presqu&apos;île</strong>
          <p className="text-charcoal/70 mt-1">Quartier Presqu&apos;île (69002). Lieu exact communiqué après validation de la commande.</p>
          <p className="text-small text-charcoal/60 mt-1">Sur rendez-vous</p>
        </li>
      </ul>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Comment ça se passe ?</h2>
      <ol className="list-decimal list-inside space-y-2 text-charcoal/80">
        <li>Passez commande sur le site.</li>
        <li>Choisissez &quot;Remise en main propre&quot; et le secteur (Vieux Lyon ou Presqu&apos;île).</li>
        <li>Nous vous contactons pour fixer le lieu et le créneau.</li>
        <li>Vous récupérez votre commande et réglez sur place si besoin.</li>
      </ol>

      <p className="mt-8">
        <Link href="/contact" className="text-gold font-medium hover:underline">Nous contacter</Link> pour toute question.
      </p>
    </StaticPageLayout>
  );
}
