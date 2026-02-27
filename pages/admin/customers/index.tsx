/**
 * Page Admin - Clients (customers)
 * /admin/customers
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Search, Loader2, Mail, ShoppingBag } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Customer {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  created_at: string;
  last_login_at: string | null;
  order_count: string;
  total_spent: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, debouncedSearch]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await axios.get(`${API_URL}/admin/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setCustomers(res.data.customers || []);
        setPagination((prev) => ({ ...prev, ...res.data.pagination }));
      }
    } catch (e) {
      console.error('Erreur clients:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Clients | Admin</title>
      </Head>

      <div className="min-h-screen bg-transparent">
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-heading text-2xl text-white flex items-center gap-2">
                  <Users className="w-7 h-7 text-gold" />
                  Clients
                  {loading && <Loader2 className="w-5 h-5 text-gold animate-spin" />}
                </h1>
                <p className="text-small text-white/60 mt-1">Liste des clients et historique d&apos;achats</p>
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

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Rechercher par email ou nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-medium text-sm">Client</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium text-sm">Rôle</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium text-sm">Commandes</th>
                    <th className="text-right py-3 px-4 text-white/70 font-medium text-sm">Total dépensé</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium text-sm">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/50">
                        Aucun client trouvé
                      </td>
                    </tr>
                  )}
                  {customers.map((c) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold">
                            {(c.name || c.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{c.name || '—'}</p>
                            <p className="text-white/60 text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-white/10 text-white/80">{c.role || 'client'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-white">
                          <ShoppingBag className="w-4 h-4 text-white/50" />
                          {c.order_count || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gold font-medium">
                        {parseFloat(c.total_spent || '0').toFixed(2)} €
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-white/60 text-sm">
                  Page {pagination.page} / {pagination.pages} · {pagination.total} clients
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
