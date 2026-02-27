/**
 * Page Admin - Gestion des commandes
 * /admin/ecommerce/orders
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Order {
  id: string;
  order_number: string;
  guest_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items_count: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mock data pour l'instant
      const mockOrders: Order[] = [
        {
          id: '1',
          order_number: 'ORD-20250209-0001',
          guest_email: 'client@example.com',
          total_amount: 159.99,
          status: 'processing',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
          items_count: 3,
        },
        {
          id: '2',
          order_number: 'ORD-20250209-0002',
          guest_email: 'user@example.com',
          total_amount: 89.50,
          status: 'pending',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          items_count: 1,
        },
        {
          id: '3',
          order_number: 'ORD-20250208-0015',
          guest_email: 'customer@test.com',
          total_amount: 249.99,
          status: 'shipped',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          items_count: 5,
        },
      ];

      setOrders(mockOrders);
      setPagination({
        page: 1,
        limit: 20,
        total: mockOrders.length,
        pages: 1,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${API_URL}/ecommerce/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success('Statut mis à jour');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600',
      paid: 'text-green-600',
      failed: 'text-red-600',
      refunded: 'text-gray-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En traitement' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' },
  ];

  return (
    <>
      <Head>
        <title>Gestion des commandes | Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/ecommerce/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
            <p className="text-gray-600 mt-1">{pagination.total} commande(s) au total</p>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Numéro de commande ou email..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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

          {/* Table des commandes */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paiement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <Link 
                            href={`/admin/ecommerce/orders/${order.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {order.order_number}
                          </Link>
                          <p className="text-xs text-gray-500">{order.items_count} article(s)</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.guest_email}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {order.total_amount.toFixed(2)}€
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border-0 cursor-pointer`}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/ecommerce/orders/${order.id}`}>
                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                              Détails →
                            </button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
