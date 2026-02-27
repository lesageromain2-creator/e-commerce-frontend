/**
 * Footer EcamSap - épuré, liens pratiques
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ECAMSAP } from '@/lib/ecamsap';

export default function EcommerceFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-offwhite mt-24">
      <div className="max-w-grid mx-auto px-6 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Marque */}
          <div className="md:col-span-4">
            <Link href="/" className="font-heading text-2xl font-semibold text-offwhite tracking-tight">
              {ECAMSAP.name}
            </Link>
            <p className="mt-4 text-small text-pearl max-w-xs">
              {ECAMSAP.tagline}. {ECAMSAP.pickup}.
            </p>
            <p className="mt-2 text-caption text-pearl/80">{ECAMSAP.newProducts}</p>
          </div>

          {/* Boutique */}
          <div className="md:col-span-2">
            <h4 className="text-small font-medium uppercase tracking-wider text-gold mb-4">Boutique</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-small text-pearl hover:text-offwhite transition-colors">Tous les articles</Link></li>
              <li><Link href="/products?onSale=true" className="text-small text-pearl hover:text-offwhite transition-colors">Promotions</Link></li>
              <li><Link href="/cart" className="text-small text-pearl hover:text-offwhite transition-colors">Panier</Link></li>
            </ul>
          </div>

          {/* Pratique */}
          <div className="md:col-span-2">
            <h4 className="text-small font-medium uppercase tracking-wider text-gold mb-4">Pratique</h4>
            <ul className="space-y-3">
              <li><Link href="/ou-trouver" className="text-small text-pearl hover:text-offwhite transition-colors">Où récupérer ma commande</Link></li>
              <li><Link href="/faq" className="text-small text-pearl hover:text-offwhite transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-small text-pearl hover:text-offwhite transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div className="md:col-span-2">
            <h4 className="text-small font-medium uppercase tracking-wider text-gold mb-4">Légal</h4>
            <ul className="space-y-3">
              <li><Link href="/mentions-legales" className="text-small text-pearl hover:text-offwhite transition-colors">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="text-small text-pearl hover:text-offwhite transition-colors">Confidentialité</Link></li>
              <li><Link href="/expedition" className="text-small text-pearl hover:text-offwhite transition-colors">Livraison & remise</Link></li>
              <li><Link href="/conditions-service" className="text-small text-pearl hover:text-offwhite transition-colors">Conditions de service</Link></li>
              <li><Link href="/conditions-vente" className="text-small text-pearl hover:text-offwhite transition-colors">Conditions de vente</Link></li>
              <li><Link href="/retours" className="text-small text-pearl hover:text-offwhite transition-colors">Retours et remboursements</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-caption text-pearl">
            © {currentYear} {ECAMSAP.name}. Tous droits réservés.
          </p>
          <p className="text-caption text-pearl">
            Remise en main propre · Lyon
          </p>
        </div>
      </div>
    </footer>
  );
}
