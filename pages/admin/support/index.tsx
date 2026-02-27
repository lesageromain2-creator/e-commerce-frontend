/**
 * Page Admin - Support (tickets)
 * /admin/support
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Loader2,
  Inbox,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  customer_email: string | null;
  customer_name: string | null;
  created_at: string;
  reply_count: string;
  assigned_to_name: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  open: { label: 'Ouvert', icon: Inbox, className: 'bg-amber-500/20 text-amber-400' },
  in_progress: { label: 'En cours', icon: Clock, className: 'bg-blue-500/20 text-blue-400' },
  waiting_reply: { label: 'En attente', icon: MessageSquare, className: 'bg-purple-500/20 text-purple-400' },
  resolved: { label: 'Résolu', icon: CheckCircle, className: 'bg-green-500/20 text-green-400' },
  closed: { label: 'Fermé', icon: XCircle, className: 'bg-gray-500/20 text-gray-400' },
};

const PRIORITY_CONFIG: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgent',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createSubject, setCreateSubject] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await axios.get(`${API_URL}/admin/support/tickets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
        setPagination((prev) => ({ ...prev, ...res.data.pagination }));
      }
    } catch (e) {
      console.error('Erreur tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createSubject.trim() || !createMessage.trim()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/support/tickets`,
        { subject: createSubject, message: createMessage, priority: 'medium' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreate(false);
      setCreateSubject('');
      setCreateMessage('');
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const getStatus = (status: string) => STATUS_CONFIG[status] || { label: status, icon: Inbox, className: 'bg-white/10 text-white' };

  return (
    <AdminLayout>
      <Head>
        <title>Support | Admin</title>
      </Head>

      <div className="min-h-screen bg-transparent">
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-heading text-2xl text-white flex items-center gap-2">
                  <MessageSquare className="w-7 h-7 text-gold" />
                  Support
                  {loading && <Loader2 className="w-5 h-5 text-gold animate-spin" />}
                </h1>
                <p className="text-small text-white/60 mt-1">Tickets et demandes clients</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-charcoal rounded-lg font-medium hover:bg-gold/90 transition"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau ticket
                </button>
                <Link href="/admin/ecommerce/dashboard" className="text-sm text-white/70 hover:text-white transition">
                  ← Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10"
            >
              <h2 className="font-heading text-lg text-white mb-4">Créer un ticket</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Sujet</label>
                  <input
                    type="text"
                    value={createSubject}
                    onChange={(e) => setCreateSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="Sujet du ticket"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Message</label>
                  <textarea
                    value={createMessage}
                    onChange={(e) => setCreateMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                    placeholder="Message..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-gold text-charcoal rounded-lg font-medium hover:bg-gold/90 disabled:opacity-50"
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center">
              <span className="text-white/70 text-sm">Filtrer :</span>
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    statusFilter === s
                      ? 'bg-gold text-charcoal'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {s === 'all' ? 'Tous' : getStatus(s).label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-white/10">
              {tickets.length === 0 && !loading && (
                <div className="py-16 text-center text-white/50 flex flex-col items-center gap-2">
                  <AlertCircle className="w-12 h-12 text-white/30" />
                  <p>Aucun ticket. Créez-en un ou les clients pourront en ouvrir depuis le site.</p>
                </div>
              )}
              {tickets.map((t) => {
                const status = getStatus(t.status);
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-white/5 transition"
                  >
                    <Link href={`/admin/support/${t.id}`} className="block">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-white/70 text-sm">{t.ticket_number}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${status.className}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                            <span className="text-white/50 text-xs">{PRIORITY_CONFIG[t.priority] || t.priority}</span>
                          </div>
                          <h3 className="font-medium text-white mt-1 truncate">{t.subject}</h3>
                          <p className="text-white/60 text-sm mt-0.5 truncate">{t.customer_email || t.customer_name || '—'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-white/50 text-sm">{t.reply_count || 0} réponses</span>
                          <p className="text-white/50 text-xs mt-1">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {pagination.pages > 1 && (
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-white/60 text-sm">
                  Page {pagination.page} / {pagination.pages} · {pagination.total} tickets
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
