/**
 * Conditions générales de vente (CGV) - EcamSap
 */

import Link from 'next/link';
import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

export default function ConditionsVentePage() {
  return (
    <StaticPageLayout
      title="Conditions générales de vente"
      description="CGV EcamSap - vente de vêtements de seconde main à Lyon."
    >
      <p className="mb-6">Les présentes CGV s’appliquent aux ventes réalisées sur le site {ECAMSAP.name}.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Produits et prix</h2>
      <p>Les produits sont des vêtements de seconde main. Les prix sont indiqués en euros TTC. {ECAMSAP.newProducts}.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Commande</h2>
      <p>La commande est validée après paiement (ou réservation pour remise sur place). Un récapitulatif vous est envoyé par email. Nous vous contactons pour organiser la remise en main propre.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Paiement</h2>
      <p>Paiement en ligne sécurisé (carte bancaire) ou sur place lors de la remise. Les moyens de paiement acceptés sont indiqués au moment du règlement.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Remise</h2>
      <p>{ECAMSAP.pickup} Le lieu et le créneau sont fixés après validation. Aucune livraison postale.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Retours</h2>
      <p>Voir la page <Link href="/retours" className="text-gold hover:underline">Retours et remboursements</Link>.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Contact</h2>
      <p>{ECAMSAP.contactEmail}</p>
    </StaticPageLayout>
  );
}
