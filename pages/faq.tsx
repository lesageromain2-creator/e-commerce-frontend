/**
 * FAQ - EcamSap
 */

import StaticPageLayout from '@/components/ecommerce/StaticPageLayout';
import { ECAMSAP } from '@/lib/ecamsap';

const faqs = [
  { q: 'Comment commander ?', a: 'Parcourez le catalogue, ajoutez les articles au panier, validez la commande. Choisissez la remise en main propre (Vieux Lyon ou Presqu\'île).' },
  { q: 'Où récupérer ma commande ?', a: ECAMSAP.pickup + ' Le lieu exact et le créneau vous sont communiqués après validation.' },
  { q: 'Quels moyens de paiement ?', a: 'Paiement en ligne sécurisé (carte) ou sur place lors de la remise en main propre.' },
  { q: 'Vous proposez des nouveautés ?', a: ECAMSAP.newProducts },
  { q: 'Puis-je échanger ou retourner un article ?', a: 'Oui, sous 14 jours selon nos conditions. Consultez la page Retours et remboursements et contactez-nous avant tout envoi.' },
  { q: 'Comment vous contacter ?', a: `Par email : ${ECAMSAP.contactEmail} ou via la page Contact.` },
];

export default function FAQPage() {
  return (
    <StaticPageLayout
      title="FAQ"
      description="Questions fréquentes - EcamSap, vêtements de seconde main à Lyon."
    >
      <ul className="space-y-8 mt-6">
        {faqs.map((item, i) => (
          <li key={i}>
            <h2 className="font-heading text-lg text-charcoal mb-2">{item.q}</h2>
            <p className="text-charcoal/80">{item.a}</p>
          </li>
        ))}
      </ul>
    </StaticPageLayout>
  );
}
