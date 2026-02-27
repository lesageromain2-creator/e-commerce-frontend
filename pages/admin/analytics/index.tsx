/**
 * Page Admin - Analytics
 * /admin/analytics
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

export default function AnalyticsPage() {
  const [revenueByDay, setRevenueByDay] = useState<{ date: string; revenue: number }[]>([]);
  const [ordersByDay, setOrdersByDay] = useState<{ date: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; units_sold: number; revenue: number }[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: string }[]>([]);
  const [totalStats, setTotalStats] = useState<{ monthRevenue: number; monthOrders: number; newCustomers: number }>({
    monthRevenue: 0,
    monthOrders: 0,
    newCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setRevenueByDay(res.data.revenueByDay || []);
        setOrdersByDay(res.data.ordersByDay || []);
        setTopProducts(res.data.topProducts || []);
        setOrdersByStatus(res.data.ordersByStatus || []);
        setTotalStats(res.data.totalStats || {});
      }
    } catch (e) {
      console.error('Erreur analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = revenueByDay.map((r) => ({
    date: r.date?.slice(5) || '',
    revenue: Number(r.revenue),
    orders: ordersByDay.find((o) => o.date === r.date)?.count ?? 0,
  }));

  if (chartData.length === 0 && ordersByDay.length > 0) {
    ordersByDay.forEach((o) => {
      if (!chartData.find((c) => c.date === o.date?.slice(5))) {
        chartData.push({ date: o.date?.slice(5) || '', revenue: 0, orders: Number(o.count) });
      }
    });
    chartData.sort((a, b) => a.date.localeCompare(b.date));
  }

  const pieData = ordersByStatus.map((s) => ({
    name: s.status,
    value: parseInt(s.count, 10),
    color: STATUS_COLORS[s.status] || '#94A3B8',
  }));

  return (
    <AdminLayout>
      <Head>
        <title>Analytics | Admin</title>
      </Head>

      <div className="min-h-screen bg-transparent">
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl text-white flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-gold" />
                  Analytics
                  {loading && <Loader2 className="w-5 h-5 text-gold animate-spin" />}
                </h1>
                <p className="text-small text-white/60 mt-1">Tendances et performances sur 30 jours</p>
              </div>
              <Link
                href="/admin/ecommerce/dashboard"
                className="text-sm text-white/70 hover:text-white transition"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Stats du mois */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-white/60 text-sm">CA du mois</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {loading ? '—' : `${totalStats.monthRevenue.toFixed(2)} €`}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-white/60 text-sm">Commandes du mois</span>
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : totalStats.monthOrders}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-white/60 text-sm">Nouveaux clients (mois)</span>
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : totalStats.newCustomers}</p>
            </motion.div>
          </section>

          {/* Graphique revenus / commandes */}
          <section className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10">
            <h2 className="font-heading text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold" />
              Revenus et commandes (30 jours)
            </h2>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `${v}€`} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(26,26,26,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number, name: string) => [name === 'revenue' ? `${value} €` : value, name === 'revenue' ? 'Revenus' : 'Commandes']}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#B8986E" strokeWidth={2} dot={false} name="revenue" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={false} name="orders" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/50">Aucune donnée sur la période</div>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Répartition par statut */}
            <section className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10">
              <h2 className="font-heading text-lg text-white mb-4">Commandes par statut</h2>
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(26,26,26,0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/50">Aucune commande</div>
                )}
              </div>
            </section>

            {/* Top produits */}
            <section className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10">
              <h2 className="font-heading text-lg text-white mb-4">Top 10 produits (ventes)</h2>
              {topProducts.length > 0 ? (
                <ul className="space-y-3">
                  {topProducts.slice(0, 10).map((p, i) => (
                    <li key={p.slug || String(i)} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <span className="text-white truncate max-w-[200px]" title={p.name}>{p.name}</span>
                      <span className="text-gold text-sm">{Number(p.units_sold)} vendus · {Number(p.revenue).toFixed(0)} €</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/50">Aucune vente enregistrée</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
