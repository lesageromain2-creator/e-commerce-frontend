/**
 * Dashboard Admin E-commerce - Vue d'ensemble
 * /admin/ecommerce
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  guest_email: string;
}

export default function AdminEcommerceDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulation des stats (à remplacer par vraie API)
      const mockStats: Stats = {
        totalRevenue: 15420.50,
        totalOrders: 127,
        pendingOrders: 8,
        totalProducts: 45,
        lowStockProducts: 5,
        totalCustomers: 89,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
      };

      setStats(mockStats);

      // Charger les commandes récentes
      // const ordersResponse = await axios.get(`${API_URL}/admin/orders/recent`);
      // setRecentOrders(ordersResponse.data.orders);
      
      // Mock data pour l'instant
      setRecentOrders([
        {
          id: '1',
          order_number: 'ORD-20250209-0001',
          total_amount: 159.99,
          status: 'processing',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
          guest_email: 'client@example.com',
        },
        {
          id: '2',
          order_number: 'ORD-20250209-0002',
          total_amount: 89.50,
          status: 'pending',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          guest_email: 'user@example.com',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gold/15 text-gold',
      processing: 'bg-charcoal/10 text-charcoal',
      shipped: 'bg-sage/20 text-sage',
      delivered: 'bg-sage/25 text-sage',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-pearl text-charcoal';
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

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard E-commerce | Atelier Vintage Admin</title>
      </Head>

      <div className="min-h-screen bg-offwhite">
        <div className="max-w-grid mx-auto px-6 lg:px-20 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-h1 text-charcoal">Dashboard E-commerce</h1>
            <p className="text-charcoal/70 mt-2">Vue d'ensemble de votre boutique</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-offwhite border border-pearl rounded-refined shadow-refined p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-small text-charcoal/70">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-charcoal mt-2">
                    {stats.totalRevenue.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>
                </div>
                <div className="bg-sage/20 p-3 rounded-refined">
                  <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-small">
                <span className="text-sage font-medium">+{stats.revenueGrowth}%</span>
                <span className="text-charcoal/50 ml-2">vs mois dernier</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-offwhite border border-pearl rounded-refined shadow-refined p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-small text-charcoal/70">Commandes</p>
                  <p className="text-2xl font-bold text-charcoal mt-2">{stats.totalOrders}</p>
                </div>
                <div className="bg-gold/15 p-3 rounded-refined">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-orange-600 font-medium">{stats.pendingOrders} en attente</span>
              </div>
            </motion.div>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Produits</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-red-600 font-medium">{stats.lowStockProducts} en rupture</span>
              </div>
            </motion.div>

            {/* Customers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Clients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
                </div>
                <div className="bg-pink-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-500">Base clients</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/ecommerce/products/create">
              <button type="button" className="w-full btn-primary flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un produit
              </button>
            </Link>
            <Link href="/admin/ecommerce/orders">
              <button type="button" className="w-full btn-secondary">Voir les commandes</button>
            </Link>
            <Link href="/admin/ecommerce/products">
              <button type="button" className="w-full btn-secondary">Gérer les produits</button>
            </Link>
            <Link href="/admin/ecommerce/settings">
              <button type="button" className="w-full btn-secondary">Paramètres</button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Commandes récentes</h2>
                <Link href="/admin/ecommerce/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Voir tout →
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.guest_email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{order.total_amount}€</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Alertes</h2>

              <div className="space-y-4">
                {stats.lowStockProducts > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-yellow-900">Stock faible</p>
                      <p className="text-sm text-yellow-700">
                        {stats.lowStockProducts} produit(s) nécessite(nt) un réapprovisionnement
                      </p>
                    </div>
                  </div>
                )}

                {stats.pendingOrders > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-900">Commandes en attente</p>
                      <p className="text-sm text-blue-700">
                        {stats.pendingOrders} commande(s) en attente de traitement
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-900">Système opérationnel</p>
                    <p className="text-sm text-green-700">
                      Tous les services fonctionnent normalement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
