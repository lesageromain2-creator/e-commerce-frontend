/**
 * Page Catalogue Produits E-commerce
 * /products
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  featured_image: string;
  images: string[];
  is_on_sale: boolean;
  stock_quantity: number;
  category_name?: string;
  brand_name?: string;
  average_rating: number;
  reviews_count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  products_count: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  // Filtres
  const [filters, setFilters] = useState({
    search: router.query.search as string || '',
    category: router.query.category as string || '',
    minPrice: router.query.minPrice as string || '',
    maxPrice: router.query.maxPrice as string || '',
    sort: router.query.sort as string || 'created_at',
    order: router.query.order as string || 'desc',
    inStock: router.query.inStock === 'true',
    onSale: router.query.onSale === 'true',
  });

  // Charger les produits
  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  // Charger les catégories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const response = await axios.get(`${API_URL}/products?${params}`);
      
      if (response.data.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/ecommerce/categories`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    
    // Mettre à jour l'URL
    const newQuery = { ...router.query, [key]: value };
    if (!value) delete newQuery[key];
    router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'created_at',
      order: 'desc',
      inStock: false,
      onSale: false,
    });
    router.push('/products', undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Catalogue Produits | VotreShop</title>
        <meta name="description" content="Découvrez notre sélection de produits de qualité" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Notre Catalogue
            </h1>
            <p className="text-xl opacity-90">
              {pagination.total} produits disponibles
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filtres */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Filtres</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Réinitialiser
                  </button>
                </div>

                {/* Recherche */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Rechercher
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    placeholder="Nom du produit..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Catégories */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Catégorie
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.products_count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prix */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Prix
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="mb-6">
                  <label className="flex items-center mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => updateFilter('inStock', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">En stock uniquement</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={(e) => updateFilter('onSale', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">En promotion</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Liste Produits */}
            <main className="lg:col-span-3">
              {/* Barre de tri */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Trier par:</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="created_at">Plus récent</option>
                    <option value="name">Nom</option>
                    <option value="price">Prix</option>
                    <option value="sales_count">Popularité</option>
                  </select>
                  <select
                    value={filters.order}
                    onChange={(e) => updateFilter('order', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="asc">Croissant</option>
                    <option value="desc">Décroissant</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {pagination.total} résultat(s)
                </div>
              </div>

              {/* Grille Produits */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">
                    Aucun produit trouvé
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/products/${product.slug}`}>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={product.featured_image || product.images[0] || '/placeholder.png'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {product.is_on_sale && (
                              <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                PROMO
                              </span>
                            )}
                            {product.stock_quantity === 0 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  Rupture de stock
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Contenu */}
                          <div className="p-4">
                            {product.category_name && (
                              <span className="text-xs text-blue-600 font-medium">
                                {product.category_name}
                              </span>
                            )}
                            <h3 className="text-lg font-bold mt-1 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            {product.short_description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {product.short_description}
                              </p>
                            )}

                            {/* Prix */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl font-bold text-gray-900">
                                {product.price}€
                              </span>
                              {product.compare_at_price && (
                                <span className="text-sm text-gray-500 line-through">
                                  {product.compare_at_price}€
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            {product.reviews_count > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <span className="text-yellow-400">★</span>
                                <span className="font-medium">{product.average_rating}</span>
                                <span className="text-gray-500">
                                  ({product.reviews_count} avis)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
                      className={`px-4 py-2 rounded-lg ${
                        pagination.page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
