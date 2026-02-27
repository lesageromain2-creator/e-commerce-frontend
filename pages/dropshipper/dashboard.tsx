/**
 * Dashboard Dropshipper - Gestion des commandes et stocks
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Package, Clock, CheckCircle, Truck, AlertTriangle,
  TrendingUp, DollarSign, Loader2, Search, Filter
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DropshipperStats {
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  ordersToday: number;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: any;
  items_count: number;
}

export default function DropshipperDashboard() {
  const [stats, setStats] = useState<DropshipperStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/dropshipper/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/ecommerce/orders`, {
          params: { status: statusFilter, limit: 20 },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      if (error.response?.status === 403) {
        toast.error('Accès refusé - Rôle dropshipper requis');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/ecommerce/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Statut mis à jour');
        fetchData();
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'En attente',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      action: 'Traiter',
      link: '/dropshipper/orders?status=pending',
    },
    {
      title: 'En traitement',
      value: stats?.processingOrders || 0,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: 'Voir',
      link: '/dropshipper/orders?status=processing',
    },
    {
      title: 'Expédiées',
      value: stats?.shippedOrders || 0,
      icon: Truck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Stock faible',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      action: 'Gérer',
      link: '/dropshipper/inventory',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'En traitement', className: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Expédiée', className: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Livrée', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-capsule text-xs font-medium ${badge.className}`}>{badge.label}</span>;
  };

  return (
    <>
      <Head>
        <title>Dashboard Dropshipper</title>
      </Head>

      <div className="min-h-screen bg-offwhite">
        {/* Header */}
        <header className="bg-white border-b border-pearl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl text-charcoal">Dashboard Dropshipping</h1>
                <p className="text-small text-charcoal/60 mt-1">
                  Gérez les commandes et les stocks
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/dropshipper/inventory" className="btn-secondary text-sm">
                  Stock
                </Link>
                <Link href="/dropshipper/orders" className="btn-primary text-sm">
                  Toutes les commandes
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Stats */}
          <section>
            <h2 className="font-heading text-xl text-charcoal mb-4">Vue d'ensemble</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-refined p-6 border border-pearl shadow-card hover:shadow-refined transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-refined ${card.bg}`}>
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-small text-charcoal/60 mb-1">{card.title}</p>
                  <p className="font-heading text-2xl font-semibold text-charcoal mb-3">{card.value}</p>
                  {card.link && (
                    <Link
                      href={card.link}
                      className="text-small text-gold hover:text-gold/80 font-medium"
                    >
                      {card.action} →
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Revenu du jour */}
          <section>
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-refined p-6 border border-gold/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-charcoal/70 mb-1">Revenu aujourd'hui</p>
                  <p className="font-heading text-3xl font-semibold text-charcoal">
                    {(stats?.totalRevenue || 0).toFixed(2)} €
                  </p>
                  <p className="text-xs text-charcoal/60 mt-1">
                    {stats?.ordersToday || 0} commande{stats?.ordersToday !== 1 ? 's' : ''}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-gold/40" />
              </div>
            </div>
          </section>

          {/* Filtres */}
          <section>
            <div className="bg-white rounded-refined p-4 border border-pearl">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-charcoal/40" />
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'processing', 'shipped', 'all'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status === 'all' ? '' : status)}
                      className={`px-4 py-2 rounded-refined text-small font-medium transition-colors ${
                        statusFilter === (status === 'all' ? '' : status)
                          ? 'bg-gold text-white'
                          : 'bg-pearl/50 text-charcoal hover:bg-pearl'
                      }`}
                    >
                      {status === 'all'
                        ? 'Toutes'
                        : status === 'pending'
                        ? 'En attente'
                        : status === 'processing'
                        ? 'En traitement'
                        : 'Expédiées'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Liste des commandes */}
          <section>
            <h2 className="font-heading text-xl text-charcoal mb-4">Commandes à traiter</h2>
            <div className="bg-white rounded-refined border border-pearl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-pearl/30 border-b border-pearl">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase">
                        N° Commande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase">
                        Articles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pearl">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-charcoal/60">
                          Aucune commande trouvée
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-pearl/20 transition-colors">
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/ecommerce/orders/${order.id}`}
                              className="text-small font-medium text-gold hover:text-gold/80"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-small text-charcoal">
                            {order.items_count || 0} article{order.items_count !== 1 ? 's' : ''}
                          </td>
                          <td className="px-6 py-4 text-small font-semibold text-charcoal">
                            {parseFloat(order.total_amount).toFixed(2)} €
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4 text-small text-charcoal/70">
                            {order.shipping_address?.city || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-small text-charcoal/60">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="px-3 py-1.5 border border-pearl rounded-refined text-xs focus:outline-none focus:ring-1 focus:ring-gold"
                            >
                              <option value="pending">En attente</option>
                              <option value="processing">En traitement</option>
                              <option value="shipped">Expédiée</option>
                              <option value="delivered">Livrée</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
