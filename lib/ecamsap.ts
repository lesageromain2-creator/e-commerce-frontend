/**
 * Identité et contenu EcamSap
 * Vente de vêtements de seconde main à petits prix – étudiants & Lyonnais
 */

export const ECAMSAP = {
  name: 'EcamSap',
  slogan: 'Seconde main, premier choix',
  tagline: 'Vêtements de seconde main à petits prix pour les étudiants et les Lyonnais',
  pickup: 'Remise en main propre sur Vieux Lyon et la Presqu\'île',
  newProducts: 'Nouveaux produits chaque semaine',
  contactEmail: 'contact@ecamsap.fr',

  /** Liens pages pratiques (footer & header) */
  legalPages: [
    { label: 'Où récupérer ma commande', href: '/ou-trouver' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/confidentialite' },
    { label: 'Livraison & remise', href: '/expedition' },
    { label: 'Conditions de service', href: '/conditions-service' },
    { label: 'Conditions de vente', href: '/conditions-vente' },
    { label: 'Retours et remboursements', href: '/retours' },
  ] as const,
} as const;
