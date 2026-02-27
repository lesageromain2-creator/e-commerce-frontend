/**
 * Homepage EcamSap — Élégante, Levi's & Ralph Lauren, jeans vintage
 * Images : public/images/levis-1.jpg, levis-2.jpg, jeans-vintage.jpg, polo-ralph-lauren.jpg
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { EcommerceLayout, ProductCard } from '@/components/ecommerce';
import type { ProductCardData } from '@/components/ecommerce/ProductCard';
import { ECAMSAP } from '@/lib/ecamsap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Images locales (déposer dans public/images/) avec fallback Unsplash
const HERO_IMAGE = { local: '/images/levis-1.jpg', fallback: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1600' };
const COLLECTIONS = [
  { slug: 'levis-1', local: '/images/levis-1.jpg', fallback: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', title: 'Levi\'s', subtitle: 'Iconique denim vintage' },
  { slug: 'levis-2', local: '/images/levis-2.jpg', fallback: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800', title: 'Levi\'s', subtitle: 'Pièces authentiques' },
  { slug: 'jeans-vintage', local: '/images/jeans-vintage.jpg', fallback: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800', title: 'Jeans vintage', subtitle: 'Coupes d\'époque' },
  { slug: 'polo-ralph', local: '/images/polo-ralph-lauren.jpg', fallback: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', title: 'Polo Ralph Lauren', subtitle: 'Cable knit & classiques' },
];

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  products_count?: number;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);
  const [latest, setLatest] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [heroSrc, setHeroSrc] = useState(HERO_IMAGE.local);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/products?featured=true&limit=8`),
      axios.get(`${API_URL}/products?limit=8&sort=created_at&order=desc`),
      axios.get(`${API_URL}/ecommerce/categories?active=true`),
    ])
      .then(([featRes, latestRes, categoriesRes]) => {
        if (featRes.data?.success) setFeatured(featRes.data.products || []);
        if (latestRes.data?.success) setLatest(latestRes.data.products || []);
        if (categoriesRes.data?.success) setCategories(categoriesRes.data.categories || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) setNewsletterSent(true);
  };

  return (
    <>
      <Head>
        <title>{ECAMSAP.name} — {ECAMSAP.tagline}</title>
        <meta name="description" content={`${ECAMSAP.tagline}. ${ECAMSAP.pickup}. Levi's, Ralph Lauren, jeans vintage.`} />
      </Head>

      <EcommerceLayout>
        {/* Hero — image Levis 1, plein écran élégant */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-charcoal">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt=""
              className="w-full h-full object-cover object-center"
              onError={() => setHeroSrc(HERO_IMAGE.fallback)}
            />
            <div className="absolute inset-0 bg-charcoal/50" />
          </div>
          <div className="relative max-w-grid mx-auto px-6 lg:px-20 text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-gold tracking-[0.3em] uppercase text-sm font-medium"
            >
              Seconde main, premier choix
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium text-offwhite tracking-tight mt-2"
            >
              {ECAMSAP.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-pearl max-w-xl mx-auto"
            >
              {ECAMSAP.tagline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-12 flex flex-wrap justify-center gap-4"
            >
              <Link href="/products" className="btn-primary">
                Voir les pièces
              </Link>
              <Link href="/ou-trouver" className="btn-secondary border-pearl text-offwhite hover:bg-white/10">
                Où récupérer ma commande
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Collections — Levis 1 & 2, jeans vintage, Polo Ralph Lauren */}
        <section className="max-w-grid mx-auto px-6 lg:px-20 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold tracking-[0.2em] uppercase text-xs font-medium">L&apos;univers</p>
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal mt-2">
              Levi&apos;s, jeans vintage & Polo Ralph Lauren
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLLECTIONS.map((col, i) => (
              <motion.div
                key={col.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href="/products"
                  className="group block overflow-hidden rounded-refined border border-pearl bg-offwhite shadow-sm hover:shadow-refined-hover transition-all duration-300"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-pearl/30">
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                      <CollectionImage local={col.local} fallback={col.fallback} alt={col.title} />
                    </div>
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-heading text-lg text-charcoal group-hover:text-gold transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-small text-charcoal/60 mt-0.5">{col.subtitle}</p>
                    <span className="inline-block mt-3 text-gold text-sm font-medium">Découvrir →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comment obtenir ta pièce */}
        <section className="bg-pearl/20 py-24">
          <div className="max-w-grid mx-auto px-6 lg:px-20">
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-14 text-center">
              Comment obtenir ta pièce
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: 1, title: 'Parcourir', text: 'Choisis parmi les pièces de seconde main à petits prix.', link: '/products', linkText: 'Voir le catalogue' },
                { step: 2, title: 'Commander', text: 'Ajoute au panier, valide et paie en ligne ou sur place.', link: '/cart', linkText: 'Voir le panier' },
                { step: 3, title: 'Récupérer', text: 'Remise en main propre sur Vieux Lyon ou la Presqu\'île.', link: '/ou-trouver', linkText: 'Où nous trouver' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-8 rounded-refined border border-pearl bg-offwhite hover:shadow-refined-hover transition-shadow"
                >
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal font-heading text-2xl">
                    {item.step}
                  </div>
                  <h3 className="font-heading text-xl text-charcoal mb-2">{item.title}</h3>
                  <p className="text-small text-charcoal/70 mb-4">{item.text}</p>
                  <Link href={item.link} className="text-gold font-medium text-small hover:underline">
                    {item.linkText} →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dernières pièces */}
        <section className="max-w-grid mx-auto px-6 lg:px-20 py-24 border-t border-pearl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <h2 className="font-heading text-2xl text-charcoal">Les dernières pièces ajoutées</h2>
            <Link href="/products" className="text-small font-medium text-gold hover:underline">
              Tout voir →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-pearl/50 rounded-refined animate-pulse" />
              ))}
            </div>
          ) : (latest.length || featured.length) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(latest.length ? latest : featured).slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-charcoal/60">
              <p>Nouveaux produits bientôt. {ECAMSAP.newProducts}</p>
              <Link href="/products" className="btn-secondary mt-4 inline-block">Voir le catalogue</Link>
            </div>
          )}
        </section>

        {/* Pourquoi EcamSap */}
        <section className="bg-charcoal py-24">
          <div className="max-w-grid mx-auto px-6 lg:px-20">
            <h2 className="font-heading text-2xl text-offwhite mb-14 text-center">Pourquoi {ECAMSAP.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
              {[
                { title: 'Petits prix', desc: 'Vêtements de seconde main accessibles aux étudiants' },
                { title: 'Lyon', desc: 'Remise en main propre Vieux Lyon & Presqu\'île' },
                { title: 'Nouveautés chaque semaine', desc: 'Nouvelles pièces postées régulièrement' },
                { title: 'Épuré & engagé', desc: 'Mode seconde main, style élégant' },
              ].map((item, i) => (
                <div key={item.title}>
                  <p className="font-heading text-lg text-gold">{item.title}</p>
                  <p className="text-small text-offwhite/70 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="max-w-grid mx-auto px-6 lg:px-20 py-24">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-heading text-2xl text-charcoal mb-2">Reste dans la boucle</h2>
            <p className="text-charcoal/70 mb-6">Reçois les annonces des nouvelles pièces en avant-première.</p>
            {newsletterSent ? (
              <p className="text-gold font-medium">Merci ! On te tient au courant.</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Courriel"
                  className="flex-1 px-4 py-3 border border-pearl rounded-refined bg-offwhite text-charcoal placeholder:text-charcoal/50 focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">S&apos;inscrire</button>
              </form>
            )}
          </div>
        </section>

        {/* Où nous trouver */}
        <section className="border-t border-pearl bg-charcoal/5 py-20">
          <div className="max-w-grid mx-auto px-6 lg:px-20 text-center">
            <h2 className="font-heading text-xl text-charcoal mb-4">La remise en main propre</h2>
            <p className="text-charcoal/70 mb-6">{ECAMSAP.pickup}</p>
            <Link href="/ou-trouver" className="text-gold font-medium hover:underline">Où récupérer ma commande →</Link>
          </div>
        </section>
      </EcommerceLayout>
    </>
  );
}

/** Image avec fallback si fichier local absent */
function CollectionImage({ local, fallback, alt }: { local: string; fallback: string; alt: string }) {
  const [src, setSrc] = useState(local);
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover object-center"
      onError={() => setSrc(fallback)}
    />
  );
}
