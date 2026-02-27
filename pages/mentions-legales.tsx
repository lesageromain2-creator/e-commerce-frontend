/**
 * Mentions légales - EcamSap
 */

import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

export default function MentionsLegalesPage() {
  return (
    <StaticPageLayout
      title="Mentions légales"
      description="Mentions légales du site EcamSap."
    >
      <p className="mb-4">Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l&apos;économie numérique, dite L.C.E.N., il est porté à la connaissance des utilisateurs du site {ECAMSAP.name} les présentes mentions légales.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Éditeur</h2>
      <p>Le site {ECAMSAP.name} est édité par [raison sociale / nom] – [adresse] – [contact : {ECAMSAP.contactEmail}].</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Hébergement</h2>
      <p>Le site est hébergé par [nom de l’hébergeur, adresse].</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Propriété intellectuelle</h2>
      <p>L’ensemble du contenu (textes, images, visuels) est protégé par le droit d’auteur. Toute reproduction non autorisée est interdite.</p>

      <h2 className="font-heading text-xl text-charcoal mt-8 mb-4">Données personnelles</h2>
      <p>Voir notre <a href="/confidentialite" className="text-gold hover:underline">Politique de confidentialité</a>.</p>
    </StaticPageLayout>
  );
}
