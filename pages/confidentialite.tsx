/**
 * Politique de confidentialité - EcamSap
 */

import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

export default function ConfidentialitePage() {
  return (
    <StaticPageLayout
      title="Politique de confidentialité"
      description="Comment EcamSap utilise et protège vos données personnelles."
    >
      <p className="mb-6">Cette politique décrit comment {ECAMSAP.name} collecte et utilise vos données.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Données collectées</h2>
      <p>Nous collectons les informations nécessaires à la commande : nom, email, adresse de livraison/remise, téléphone si besoin. Les données de paiement sont traitées par notre prestataire sécurisé (Stripe) et ne sont pas stockées sur nos serveurs.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Utilisation</h2>
      <p>Vos données servent à traiter vos commandes, à vous contacter pour la remise en main propre et à répondre à vos demandes. Nous ne vendons pas vos données à des tiers.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Conservation et droits</h2>
      <p>Les données sont conservées pendant la durée nécessaire à la relation client et aux obligations légales. Vous disposez d’un droit d’accès, de rectification et de suppression. Contact : {ECAMSAP.contactEmail}.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Cookies</h2>
      <p>Le site utilise des cookies techniques pour le bon fonctionnement du panier et de la session. Vous pouvez configurer votre navigateur pour les refuser.</p>
    </StaticPageLayout>
  );
}
