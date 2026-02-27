/**
 * Détail Produit - EcamSap
 * Options type Bisart : taille, quantité, livraison/remise, retours
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'react-toastify';
import { EcommerceLayout } from '@/components/ecommerce';
import { ECAMSAP } from '@/lib/ecamsap';
import { getProductImageUrl } from '@/utils/productImageUrl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  sku: string;
  images: string[];
  featured_image: string;
  stock_quantity: number;
  is_on_sale: boolean;
  is_featured: boolean;
  category_name: string;
  category_id?: string;
  category_slug: string;
  brand_name: string;
  brand_logo: string;
  average_rating: number;
  reviews_count: number;
  variants?: any[];
  reviews?: any[];
  meta_title?: string;
  meta_description?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const { addItem, isLoading: cartLoading } = useCartStore();

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching product:', slug);
      console.log('🔍 API URL:', `${API_URL}/products/${slug}`);
      
      const res = await axios.get(`${API_URL}/products/${slug}`);
      console.log('✅ Product response:', res.data);
      
      if (res.data.success) {
        setProduct(res.data.product);
      } else {
        console.error('❌ Product not found');
        router.push('/404');
      }
    } catch (e: any) {
      console.error('❌ Error fetching product:', e);
      console.error('Response:', e.response?.data);
      if (e.response?.status === 404) router.push('/404');
      else toast.error('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.stock_quantity === 0) {
      toast.error('Produit en rupture de stock');
      return;
    }
    if (quantity > product.stock_quantity) {
      toast.error(`Stock disponible : ${product.stock_quantity}`);
      return;
    }
    await addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: selectedVariant?.name,
      sku: selectedVariant?.sku || product.sku,
      price: selectedVariant ? parseFloat(product.price) + parseFloat(selectedVariant.price_adjustment || 0) : parseFloat(product.price),
      quantity,
      image: product.featured_image || product.images?.[0],
      slug: product.slug,
      maxStock: selectedVariant?.stock_quantity ?? product.stock_quantity,
    });
    const err = useCartStore.getState().error;
    if (err) toast.warning(err);
    else toast.success('Produit ajouté au panier');
    setQuantity(1);
  };

  if (loading) {
    return (
      <EcommerceLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </EcommerceLayout>
    );
  }
  if (!product) return null;

  const toNum = (val: any) => {
    if (val == null) return 0;
    const n = typeof val === 'number' ? val : parseFloat(val);
    return isFinite(n) ? n : 0;
  };

  const currentPrice = selectedVariant
    ? toNum(product.price) + toNum(selectedVariant.price_adjustment)
    : toNum(product.price);
  const availableStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
  const images = product.images?.length ? product.images : [product.featured_image].filter(Boolean);

  return (
    <>
      <Head>
        <title>{product.meta_title || product.name} | {ECAMSAP.name}</title>
        <meta name="description" content={product.meta_description || product.short_description} />
      </Head>

      <EcommerceLayout>
        <div className="max-w-grid mx-auto px-6 lg:px-20 py-8 lg:py-12">
          {/* Fil d'Ariane */}
          <nav className="text-small text-charcoal/70 mb-8">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-gold transition-colors">Boutique</Link>
            {product.category_name && (
              <>
                <span className="mx-2">/</span>
                <Link href={product.category_id ? `/products?category=${product.category_id}` : '/products'} className="hover:text-gold transition-colors">
                  {product.category_name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-charcoal">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Galerie */}
            <div className="space-y-4">
              <div className="aspect-product rounded-refined overflow-hidden bg-pearl/30 border border-pearl/50">
                <img
                  src={getProductImageUrl(images[selectedImage]) || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.is_on_sale && (
                  <span className="absolute top-4 right-4 badge-gold">Promo</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-refined overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === i ? 'border-gold' : 'border-pearl hover:border-charcoal/20'
                      }`}
                    >
                      <img src={getProductImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos + CTA */}
            <div>
              {product.brand_name && (
                <p className="text-caption text-gold uppercase tracking-wider mb-2">{product.brand_name}</p>
              )}
              <h1 className="font-heading text-h1 text-charcoal mb-4">{product.name}</h1>
              {product.reviews_count > 0 && (
                <div className="flex items-center gap-2 text-small text-charcoal/70 mb-4">
                  <span className="text-gold">★</span> {product.average_rating} ({product.reviews_count} avis)
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-body text-2xl font-semibold text-charcoal">{currentPrice.toFixed(2)} €</span>
                {product.compare_at_price != null && product.compare_at_price > currentPrice && (
                  <span className="text-small text-charcoal/50 line-through">{product.compare_at_price} €</span>
                )}
              </div>

              {product.short_description && (
                <p className="text-body text-charcoal/80 mb-6">{product.short_description}</p>
              )}

              {/* Stock */}
              <div className="mb-6">
                {availableStock > 0 ? (
                  <span className="badge-sage">En stock — {availableStock} disponible{availableStock > 1 ? 's' : ''}</span>
                ) : (
                  <span className="badge-capsule bg-charcoal/10 text-charcoal">Rupture de stock</span>
                )}
              </div>

              {/* Taille / Variantes - style Bisart */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <p className="text-caption text-charcoal/70 mb-2">Taille</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        disabled={!v.is_active || v.stock_quantity === 0}
                        className={`px-4 py-2 rounded-refined border text-small font-medium transition-all duration-300 disabled:opacity-40 ${
                          selectedVariant?.id === v.id
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-pearl text-charcoal hover:border-gold hover:text-gold'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div className="mb-8">
                <p className="text-caption text-charcoal/70 mb-2">Quantité</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 border border-pearl rounded-refined hover:border-gold hover:text-gold transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={availableStock}
                    className="w-14 text-center border border-pearl rounded-refined py-2 text-small focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    className="w-10 h-10 border border-pearl rounded-refined hover:border-gold hover:text-gold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={availableStock === 0 || cartLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartLoading ? 'Ajout...' : 'Ajouter au panier'}
                </button>
                <Link href="/cart" className="btn-secondary">
                  Voir le panier
                </Link>
              </div>

              <p className="mt-4 text-caption text-charcoal/60">SKU : {selectedVariant?.sku || product.sku}</p>

              {/* Livraison / Remise - infos EcamSap */}
              <div className="mt-8 p-4 rounded-refined bg-pearl/20 border border-pearl/50">
                <p className="text-small font-medium text-charcoal mb-1">Livraison & remise</p>
                <p className="text-caption text-charcoal/70">{ECAMSAP.pickup}</p>
                <Link href="/ou-trouver" className="text-caption text-gold hover:underline mt-2 inline-block">Où récupérer ma commande →</Link>
              </div>
              <div className="mt-3 text-caption text-charcoal/60">
                <Link href="/retours" className="text-gold hover:underline">Retours et remboursements</Link>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <section className="mt-16 pt-16 border-t border-pearl">
              <h2 className="font-heading text-h2 text-charcoal mb-6">Description</h2>
              <div className="prose prose-charcoal max-w-none text-charcoal/80" dangerouslySetInnerHTML={{ __html: product.description }} />
            </section>
          )}

          {/* Avis */}
          {product.reviews && product.reviews.length > 0 && (
            <section className="mt-16 pt-16 border-t border-pearl">
              <h2 className="font-heading text-h2 text-charcoal mb-6">Avis ({product.reviews_count})</h2>
              <div className="space-y-6">
                {product.reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-pearl pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-pearl flex items-center justify-center font-body font-medium text-charcoal">
                          {r.firstname?.[0]}{r.lastname?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{r.firstname} {r.lastname}</p>
                          <p className="text-caption text-gold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                        </div>
                      </div>
                      <span className="text-caption text-charcoal/50">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {r.title && <p className="font-medium text-charcoal mb-1">{r.title}</p>}
                    <p className="text-small text-charcoal/80">{r.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </EcommerceLayout>
    </>
  );
}
