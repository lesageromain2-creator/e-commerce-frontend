/**
 * Page Détail Produit E-commerce
 * /products/[slug]
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'react-toastify';

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
  video_url?: string;
  stock_quantity: number;
  is_on_sale: boolean;
  is_featured: boolean;
  category_name: string;
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
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products/${slug}`);
      if (response.data.success) {
        setProduct(response.data.product);
      } else {
        router.push('/404');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        router.push('/404');
      }
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

    try {
      await addItem({
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        variantName: selectedVariant?.name,
        sku: selectedVariant?.sku || product.sku,
        price: selectedVariant 
          ? parseFloat(product.price) + parseFloat(selectedVariant.price_adjustment || 0)
          : parseFloat(product.price),
        quantity,
        image: product.featured_image || product.images[0],
        slug: product.slug,
        maxStock: selectedVariant?.stock_quantity || product.stock_quantity,
      });

      toast.success('Produit ajouté au panier !');
      setQuantity(1);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentPrice = selectedVariant
    ? parseFloat(product.price) + parseFloat(selectedVariant.price_adjustment || 0)
    : parseFloat(product.price);

  const availableStock = selectedVariant?.stock_quantity ?? product.stock_quantity;

  return (
    <>
      <Head>
        <title>{product.meta_title || product.name} | VotreShop</title>
        <meta 
          name="description" 
          content={product.meta_description || product.short_description} 
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Accueil</Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-blue-600">Produits</Link>
              {product.category_slug && (
                <>
                  <span className="mx-2">/</span>
                  <Link 
                    href={`/products?category=${product.category_slug}`} 
                    className="hover:text-blue-600"
                  >
                    {product.category_name}
                  </Link>
                </>
              )}
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Galerie Images */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.images[selectedImage] || product.featured_image || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.is_on_sale && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                      PROMO
                    </span>
                  )}
                </div>
              </div>

              {/* Miniatures */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations Produit */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                {product.brand_name && (
                  <div className="flex items-center gap-3 mb-4">
                    {product.brand_logo && (
                      <img src={product.brand_logo} alt={product.brand_name} className="h-8" />
                    )}
                    <span className="text-sm text-gray-600">{product.brand_name}</span>
                  </div>
                )}

                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

                {/* Rating */}
                {product.reviews_count > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(product.average_rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {product.average_rating} ({product.reviews_count} avis)
                    </span>
                  </div>
                )}

                {/* Prix */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-gray-900">
                      {currentPrice.toFixed(2)}€
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xl text-gray-500 line-through">
                        {product.compare_at_price}€
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">TVA incluse, hors frais de port</p>
                </div>

                {/* Description courte */}
                {product.short_description && (
                  <p className="text-gray-700 mb-6">{product.short_description}</p>
                )}

                {/* Stock */}
                <div className="mb-6">
                  {availableStock > 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        En stock ({availableStock} disponible{availableStock > 1 ? 's' : ''})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Rupture de stock</span>
                    </div>
                  )}
                </div>

                {/* Variantes */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Options disponibles
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={!variant.is_active || variant.stock_quantity === 0}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantité */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Quantité</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={availableStock}
                      className="w-20 text-center border border-gray-300 rounded-lg py-2"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={availableStock === 0 || cartLoading}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {cartLoading ? 'Ajout...' : 'Ajouter au panier'}
                  </button>
                  <button className="border-2 border-gray-300 p-3 rounded-lg hover:border-red-500 hover:text-red-500 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* SKU */}
                <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                  <p><span className="font-medium">SKU:</span> {selectedVariant?.sku || product.sku}</p>
                  <p><span className="font-medium">Catégorie:</span> {product.category_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description détaillée */}
          {product.description && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-12">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Avis clients */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">
                Avis clients ({product.reviews_count})
              </h2>
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                          {review.firstname?.[0]}{review.lastname?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {review.firstname} {review.lastname}
                          </p>
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && (
                      <h4 className="font-medium mb-1">{review.title}</h4>
                    )}
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
