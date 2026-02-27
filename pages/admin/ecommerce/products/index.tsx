/**
 * Page Admin - Gestion des produits
 * /admin/ecommerce/products
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  status: string;
  category_name?: string;
  brand_name?: string;
  featured_image: string;
  sales_count: number;
  created_at: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: 'created_at',
        order: 'desc',
      });

      // Note: Cette route devra être créée en tant que route admin
      const response = await axios.get(`${API_URL}/products?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast.success('Produit supprimé');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  return (
    <>
      <Head>
        <title>Gestion des produits | Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <Link
                href="/admin/ecommerce/dashboard"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
              <p className="text-gray-600 mt-1">{pagination.total} produit(s) au total</p>
            </div>
            <Link href="/admin/ecommerce/products/create">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau produit
              </button>
            </Link>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="draft">Brouillon</option>
                <option value="archived">Archivé</option>
              </select>
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Table des produits */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
                <Link href="/admin/ecommerce/products/create">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Créer le premier produit
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ventes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.featured_image || '/placeholder.png'}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                {product.category_name && (
                                  <p className="text-sm text-gray-500">{product.category_name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {product.price}€
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`font-medium ${
                              product.stock_quantity === 0
                                ? 'text-red-600'
                                : product.stock_quantity < 10
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}>
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.sales_count}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <button className="text-gray-600 hover:text-blue-600 transition-colors">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              </Link>
                              <button
                                onClick={() => router.push(`/admin/ecommerce/products/${product.id}/edit`)}
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {pagination.page} sur {pagination.pages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
