/**
 * Page Admin - Finances & Revenus
 * /admin/finances
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  Calendar, Download, FileText, PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FinanceStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  averageOrderValue: number;
  totalOrders: number;
  revenueGrowth: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface CategorySales {
  name: string;
  value: number;
  color: string;
}

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

export default function FinancesPage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsRes, revenueRes, categoryRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/finances/stats?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/finances/revenue?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/finances/by-category`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/finances/top-products?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (revenueRes.data.success) setRevenueData(revenueRes.data.revenue);
      if (categoryRes.data.success) {
        const categoriesWithColors = categoryRes.data.categories.map((cat: any, index: number) => ({
          ...cat,
          color: COLORS[index % COLORS.length],
        }));
        setCategorySales(categoriesWithColors);
      }
      if (productsRes.data.success) setTopProducts(productsRes.data.products);
    } catch (error) {
      console.error('Erreur chargement finances:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/finances/export?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finances_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Rapport exporté avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const statCards = [
    {
      title: 'Chiffre d\'affaires',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} €`,
      subtitle: 'Total',
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      growth: stats?.revenueGrowth,
    },
    {
      title: 'Ce mois',
      value: `${(stats?.revenueThisMonth || 0).toFixed(2)} €`,
      subtitle: `vs ${(stats?.revenueLastMonth || 0).toFixed(2)} € mois dernier`,
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      title: 'Panier moyen',
      value: `${(stats?.averageOrderValue || 0).toFixed(2)} €`,
      subtitle: `${stats?.totalOrders || 0} commandes`,
      icon: CreditCard,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
    },
    {
      title: 'Marge bénéficiaire',
      value: `${(stats?.profitMargin || 0).toFixed(1)}%`,
      subtitle: `Profit: ${(stats?.totalProfit || 0).toFixed(2)} €`,
      icon: PieChartIcon,
      color: 'text-gold',
      bg: 'bg-gold/20',
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Finances | Admin</title>
      </Head>

      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl text-white">Finances & Revenus</h1>
                <p className="text-small text-white/60 mt-1">Analyse financière et rapports</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">3 derniers mois</option>
                  <option value="1y">12 derniers mois</option>
                </select>
                <button
                  onClick={handleExport}
                  className="text-xs px-3 py-2 bg-gold text-charcoal rounded-md hover:bg-gold/90 transition font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Stats principales */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-refined ${card.bg}`}>
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    {card.growth !== undefined && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        card.growth > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {card.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(card.growth)}%
                      </div>
                    )}
                  </div>
                  <p className="text-small text-white/60 mb-1">{card.title}</p>
                  <p className="font-heading text-2xl font-semibold text-white">{card.value}</p>
                  {card.subtitle && <p className="text-xs text-white/50 mt-1">{card.subtitle}</p>}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Graphique revenus */}
          <section>
            <h2 className="font-heading text-xl text-white mb-4">Évolution du chiffre d'affaires</h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 14, 39, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenus (€)"
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    name="Commandes"
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ventes par catégorie */}
            <section>
              <h2 className="font-heading text-xl text-white mb-4">Ventes par catégorie</h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categorySales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 14, 39, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Top produits */}
            <section>
              <h2 className="font-heading text-xl text-white mb-4">Top 10 produits</h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontSize: '10px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 14, 39, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#F59E0B" name="Revenus (€)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Actions rapides */}
          <section>
            <h2 className="font-heading text-xl text-white mb-4">Rapports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10 hover:border-gold hover:bg-white/10 transition-all text-left group">
                <FileText className="w-8 h-8 text-gold mb-3" />
                <h3 className="font-heading text-lg text-white mb-1 group-hover:text-gold transition-colors">
                  Rapport TVA
                </h3>
                <p className="text-small text-white/60">Génerer le rapport de TVA</p>
              </button>

              <button className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10 hover:border-gold hover:bg-white/10 transition-all text-left group">
                <DollarSign className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-heading text-lg text-white mb-1 group-hover:text-gold transition-colors">
                  Analyse profit
                </h3>
                <p className="text-small text-white/60">Marges et bénéfices par produit</p>
              </button>

              <button className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10 hover:border-gold hover:bg-white/10 transition-all text-left group">
                <CreditCard className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-heading text-lg text-white mb-1 group-hover:text-gold transition-colors">
                  Moyens de paiement
                </h3>
                <p className="text-small text-white/60">Répartition par méthode</p>
              </button>
            </div>
          </section>
        </main>
      </div>
    </AdminLayout>
  );
}
