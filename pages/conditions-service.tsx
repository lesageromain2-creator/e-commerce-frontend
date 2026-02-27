/**
 * Conditions de service - EcamSap
 */

import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

export default function ConditionsServicePage() {
  return (
    <StaticPageLayout
      title="Conditions de service"
      description="Conditions d'utilisation du site EcamSap."
    >
      <p className="mb-6">L’utilisation du site {ECAMSAP.name} implique l’acceptation des présentes conditions de service.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Objet du site</h2>
      <p>Le site permet d’acheter des vêtements de seconde main, à petits prix, avec remise en main propre à Lyon (Vieux Lyon, Presqu&apos;île).</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Utilisation</h2>
      <p>Vous vous engagez à fournir des informations exactes et à utiliser le site de bonne foi. Toute utilisation frauduleuse ou abusive peut entraîner la suspension de l’accès.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Propriété intellectuelle</h2>
      <p>Le contenu du site (textes, images, marque) est protégé. Toute reproduction non autorisée est interdite.</p>
    </StaticPageLayout>
  );
}
