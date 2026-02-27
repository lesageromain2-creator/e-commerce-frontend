/**
 * Catalogue Produits - Atelier Vintage
 * Refined Versatility: grille 12 colonnes, marges 80px, cartes 4:5
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';
import { EcommerceLayout, ProductCard } from '@/components/ecommerce';
import type { ProductCardData } from '@/components/ecommerce/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Category {
  id: string;
  name: string;
  slug: string;
  products_count: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    search: (router.query.search as string) || '',
    category: (router.query.category as string) || '',
    minPrice: (router.query.minPrice as string) || '',
    maxPrice: (router.query.maxPrice as string) || '',
    sort: (router.query.sort as string) || 'created_at',
    order: (router.query.order as string) || 'desc',
    inStock: router.query.inStock === 'true',
    onSale: router.query.onSale === 'true',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page, router.query]);

  useEffect(() => {
    axios.get(`${API_URL}/ecommerce/categories`).then((res) => {
      if (res.data?.success) setCategories(res.data.categories || []);
    });
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
        order: filters.order,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = 'true';
      if (filters.onSale) params.onSale = 'true';

      const response = await axios.get(`${API_URL}/products?${new URLSearchParams(params)}`);
      if (response.data.success) {
        setProducts(response.data.products || []);
        setPagination((prev) => ({ ...prev, ...response.data.pagination }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    const q = { ...router.query, [key]: value };
    if (value === '' || value === false) delete q[key];
    router.push({ pathname: '/products', query: q }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    setFilters({
      search: '', category: '', minPrice: '', maxPrice: '',
      sort: 'created_at', order: 'desc', inStock: false, onSale: false,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    router.push('/products', undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Boutique | Atelier Vintage</title>
        <meta name="description" content="Découvrez notre collection de vêtements et accessoires vintage." />
      </Head>

      <EcommerceLayout>
        <div className="max-w-grid mx-auto px-6 lg:px-20 py-12 lg:py-16">
          {/* Titre + résultat */}
          <div className="mb-10">
            <h1 className="font-heading text-h1 text-charcoal">Boutique</h1>
            <p className="mt-2 text-body text-charcoal/70">{pagination.total} article{pagination.total !== 1 ? 's' : ''}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Filtres - sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-small font-medium uppercase tracking-wider text-charcoal">Filtres</h2>
                  <button type="button" onClick={clearFilters} className="text-caption text-gold hover:underline">
                    Réinitialiser
                  </button>
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all text-small"
                />
                <div>
                  <label className="block text-caption text-charcoal/70 mb-2">Catégorie</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite text-charcoal text-small focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="">Toutes</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.products_count ?? 0})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-caption text-charcoal/70 mb-2">Prix (€)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-pearl rounded-refined bg-offwhite text-small"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-pearl rounded-refined bg-offwhite text-small"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                    className="rounded border-pearl text-gold focus:ring-gold"
                  />
                  <span className="text-small text-charcoal">En stock uniquement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => updateFilter('onSale', e.target.checked)}
                    className="rounded border-pearl text-gold focus:ring-gold"
                  />
                  <span className="text-small text-charcoal">En promotion</span>
                </label>
              </div>
            </aside>

            {/* Grille produits - 9 colonnes */}
            <main className="lg:col-span-9">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="px-3 py-2 border border-pearl rounded-refined bg-offwhite text-small focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="created_at">Plus récent</option>
                  <option value="name">Nom</option>
                  <option value="price">Prix</option>
                  <option value="sales_count">Popularité</option>
                </select>
                <select
                  value={filters.order}
                  onChange={(e) => updateFilter('order', e.target.value)}
                  className="px-3 py-2 border border-pearl rounded-refined bg-offwhite text-small focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-product bg-pearl/50 rounded-refined animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-charcoal/70 mb-4">Aucun produit trouvé.</p>
                  <button type="button" onClick={clearFilters} className="btn-secondary">Réinitialiser les filtres</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="flex items-center px-4 text-small text-charcoal">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </EcommerceLayout>
    </>
  );
}
