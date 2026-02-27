// frontend/pages/index-hotel.js - Homepage Hôtel style Hotel Glasgow Monceau (/index-hotel)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { hotelApi } from '../utils/hotelApi';
import {
  DEFAULT_HOTEL,
  HERO_SELLING_POINTS,
  SERVICES_LIST,
  REASONS_TO_BOOK,
  BREAKFAST_ITEMS,
} from '../lib/hotelConstants';
import { HOTEL_IMAGES, HERO_FALLBACK } from '../lib/hotelImages';
import {
  Bed,
  UtensilsCrossed,
  Tag,
  MapPin,
  Star,
  ArrowRight,
  Leaf,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';

const defaultSettings = { site_name: DEFAULT_HOTEL.name };

export default function HomePageHotel() {
  const [hotel, setHotel] = useState(null);
  const [heroImage, setHeroImage] = useState('');
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    hotelApi.getHotel().then(setHotel).catch(() => setHotel(null));
    hotelApi.getOffers().then(setOffers).catch(() => setOffers([]));
  }, []);

  useEffect(() => {
    setHeroImage(hotel?.hero_image_url || HERO_FALLBACK.src);
  }, [hotel]);

  const siteName = hotel?.name || DEFAULT_HOTEL.name;
  const tagline = hotel?.tagline || DEFAULT_HOTEL.tagline;

  return (
    <>
      <Head>
        <title>{siteName} – Chambres, Petit-déjeuner, Réservez directement</title>
        <meta name="description" content={`${tagline}. Chambres climatisées, literie haut de gamme, petit-déjeuner inclus. Réservez sur notre site pour le meilleur tarif.`} />
      </Head>
      <Header settings={{ site_name: siteName }} />

      <div className="min-h-screen bg-[#1A1A1A] text-[#FAFAF8]">
        {/* Hero */}
        <section className="relative min-h-[85vh] flex flex-col justify-end pb-20 md:pb-28">
          <div className="absolute inset-0 bg-[#1A1A1A]">
            {heroImage ? (
              <Image src={heroImage} alt="" fill className="object-cover opacity-70" priority sizes="100vw" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#C9A96E]/20 via-[#1A1A1A] to-[#1A1A1A]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/95 via-[#1A1A1A]/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center">
            <blockquote className="subtitle-luxury mb-4 text-[#C9A96E]">
              &ldquo; Hôtel calme et chaleureux au personnel très agréable avec le sens du service. &rdquo;
            </blockquote>
            <p className="mb-6 flex items-center justify-center gap-2 text-sm text-[#8B8680]">
              <Star className="h-4 w-4 fill-[#C9A96E] text-[#C9A96E]" />
              Avis Google 5/5
            </p>
            <h1 className="font-heading text-4xl font-light tracking-tight md:text-6xl lg:text-7xl">
              Bienvenue à {siteName}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#B5B1AC] md:text-xl">
              {tagline}
            </p>
            <div className="divider-luxury" />
            <Link
              href="/reservation-chambre"
              className="btn-luxury-secondary mt-6"
            >
              Réserver <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* 4 points clés */}
        <section className="border-t border-[#C9A96E]/10 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HERO_SELLING_POINTS.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#C9A96E]/20 bg-[#1A1A1A]/80 p-6 transition-colors hover:border-[#C9A96E]/40"
                >
                  <h3 className="font-heading text-lg font-semibold text-[#FAFAF8]">{p.title}</h3>
                  <p className="mt-1 text-sm text-[#8B8680]">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Présentation Hôtel - 37 chambres */}
        <section className="border-t border-[#C9A96E]/10 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="subtitle-luxury">{siteName}</p>
                <h2 className="mt-2 font-heading text-3xl font-light md:text-4xl">
                  Intime, design et chaleureux
                </h2>
                <p className="mt-6 leading-relaxed text-[#B5B1AC]">
                  Avec ses <strong className="text-[#FAFAF8]">37 chambres</strong> conçues comme de véritables cocons, notre établissement vous offre un cadre propice au repos : <strong className="text-[#FAFAF8]">literie haut de gamme</strong>, salles de bain modernes. Toutes les chambres sont <strong className="text-[#FAFAF8]">climatisées</strong> et disposent du <strong className="text-[#FAFAF8]">wifi haut débit</strong> gratuit.
                </p>
                <p className="mt-4 text-[#8B8680]">
                  Salon cosy et élégant ouvert sur un joli <strong>patio arboré</strong>, véritable havre de paix en plein cœur de la ville.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/sejour" className="btn-luxury-secondary">
                    Voir les chambres <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/reservation-chambre" className="btn-luxury-tertiary-light">
                    Réserver
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#1A1A1A] ring-1 ring-[#C9A96E]/20">
                <Image
                  src={HOTEL_IMAGES.hotel[0].src}
                  alt={HOTEL_IMAGES.hotel[0].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Petit-déjeuner */}
        <section className="py-16 md:py-24 border-t border-white/5 bg-[#1A1A1A]/30">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-heading font-light uppercase tracking-wider">
                Notre Petit-déjeuner
              </h2>
              <p className="mt-4 text-[#8B8680] max-w-2xl mx-auto">
                Régalez vos papilles dès le réveil ! Jus d&apos;orange fraîchement pressés, fruits frais, viennoiseries artisanales. Options sans gluten sur demande. Dégustez en chambre sans supplément.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mb-10">
              {HOTEL_IMAGES.breakfast.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#1A1A1A]/80 ring-1 ring-white/5 group">
                  <Image src={img.src} alt={img.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 right-4 text-slate-200 text-sm">{img.text}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {BREAKFAST_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#1A1A1A]/80/50 border border-white/5">
                  <UtensilsCrossed className="w-5 h-5 text-[#C9A96E] shrink-0" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/restauration"
                className="inline-flex items-center gap-2 text-[#C9A96E] hover:text-amber-300 font-medium"
              >
                Découvrir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-heading font-light">
                Pourquoi venir chez nous ?
              </h2>
              <p className="mt-2 text-[#8B8680]">Des services adaptés pour un séjour confortable</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {SERVICES_LIST.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#1A1A1A]/50 border border-white/5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9A96E]/20 text-[#C9A96E] text-sm font-bold">{i + 1}</span>
                  <span className="text-slate-200">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded-lg font-medium transition-colors"
              >
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Emplacement */}
        <section className="py-16 md:py-24 border-t border-white/5 bg-[#1A1A1A]/30">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-light">
                  À quelques pas des attractions
                </h2>
                <p className="mt-4 text-[#B5B1AC] leading-relaxed">
                  Situation idéale dans une rue paisible au cœur de la ville. Entre marchés et quartiers animés, commerce, restaurants et jardins à proximité. Métro à quelques pas pour rejoindre les principales attractions.
                </p>
                <p className="mt-4 text-[#8B8680]">
                  Disponible 24h/24, notre équipe est à votre disposition pour faciliter votre séjour.
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 text-[#C9A96E] hover:text-amber-300 font-medium"
                >
                  <MapPin className="w-4 h-4" /> Nous localiser
                </Link>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#1A1A1A]/80 ring-1 ring-white/10">
                <Image
                  src={HOTEL_IMAGES.hotel[6].src}
                  alt={HOTEL_IMAGES.hotel[6].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[#1A1A1A]/40 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-[#C9A96E]/80" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Éco-responsabilité */}
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative aspect-square md:aspect-[4/3] w-full md:w-80 rounded-2xl overflow-hidden bg-emerald-900/20 border border-emerald-500/20 ring-1 ring-white/5">
                <Image
                  src={HOTEL_IMAGES.hotel[7].src}
                  alt="Patio arboré"
                  fill
                  className="object-cover opacity-80"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/30">
                  <Leaf className="w-16 h-16 text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-light">
                  Notre éco-responsabilité
                </h2>
                <p className="mt-4 text-[#B5B1AC] leading-relaxed">
                  Nous réduisons chaque jour notre empreinte carbone. Politique zéro-papier, zéro-plastique à usage unique. Nous diminuons les consommations d&apos;eau et d&apos;électricité, utilisons des produits régionaux et des produits d&apos;entretien respectueux de l&apos;environnement et de la santé.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5 raisons de réserver */}
        <section className="py-16 md:py-24 border-t border-white/5 bg-[#1A1A1A]/30">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl font-heading font-light text-center mb-12">
              5 raisons de réserver sur notre site
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {REASONS_TO_BOOK.map((r, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10 text-center">
                  <Shield className="w-8 h-8 text-[#C9A96E] mx-auto mb-3" />
                  <h3 className="font-semibold text-white">{r.title}</h3>
                  <p className="mt-1 text-[#8B8680] text-sm">{r.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/reservation-chambre"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A96E] hover:bg-[#C9A96E] text-[#1A1A1A] font-medium rounded-lg transition-colors"
              >
                Réserver maintenant <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Offres si disponibles */}
        {offers.length > 0 && (
          <section className="py-16 md:py-24 border-t border-white/5">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <h2 className="text-2xl md:text-3xl font-heading font-light text-center mb-12">
                Nos offres
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {offers.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    href="/reservation-chambre"
                    className="block p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10 hover:border-[#C9A96E]/30 transition-colors"
                  >
                    <Tag className="w-8 h-8 text-[#C9A96E] mb-3" />
                    <h3 className="text-lg font-semibold text-white">{o.name}</h3>
                    {(o.short_description || o.description) && (
                      <p className="mt-2 text-[#8B8680] text-sm line-clamp-2">{o.short_description || o.description}</p>
                    )}
                    {o.price_from != null && (
                      <p className="mt-2 text-[#C9A96E] font-medium">À partir de {Number(o.price_from).toFixed(0)} €</p>
                    )}
                  </Link>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/offres-hotel" className="text-[#C9A96E] hover:text-amber-300 font-medium">
                  Voir toutes les offres →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Localisation / Contact */}
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-light mb-8">
              Nous localiser
            </h2>
            <div className="space-y-2 text-[#B5B1AC]">
              <p className="font-semibold text-white">{siteName}</p>
              <p>{hotel?.address || DEFAULT_HOTEL.address}</p>
              <p>{hotel?.postalCode || DEFAULT_HOTEL.postalCode} {hotel?.city || DEFAULT_HOTEL.city}</p>
              <p className="pt-4">
                <a href={`tel:${hotel?.phone || DEFAULT_HOTEL.phone}`} className="inline-flex items-center gap-2 text-[#C9A96E] hover:text-amber-300">
                  <Phone className="w-4 h-4" /> {hotel?.phone || DEFAULT_HOTEL.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${hotel?.email || DEFAULT_HOTEL.email}`} className="inline-flex items-center gap-2 text-[#C9A96E] hover:text-amber-300">
                  <Mail className="w-4 h-4" /> {hotel?.email || DEFAULT_HOTEL.email}
                </a>
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 border border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E]/10 rounded-lg font-medium transition-colors"
            >
              Contact & Accès <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      <Footer settings={{ site_name: siteName }} />
    </>
  );
}
