/**
 * Détail d'un ticket support - /admin/support/[id]
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Loader2,
  ArrowLeft,
  Send,
  User,
  Headphones,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting_reply', label: 'En attente réponse' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Fermé' },
];

export default function SupportTicketDetailPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/support/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setTicket(res.data.ticket);
        setReplies(res.data.replies || []);
      }
    } catch (e) {
      console.error('Erreur ticket:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/admin/support/tickets/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicket((t: any) => (t ? { ...t, status: newStatus } : null));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/admin/support/tickets/${id}/replies`,
        { message: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        setReplies((prev) => [...prev, res.data.reply]);
        setReplyText('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading && !ticket) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white/70">
            <p>Ticket introuvable</p>
            <Link href="/admin/support" className="text-gold hover:underline mt-2 inline-block">
              Retour au support
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Ticket {ticket.ticket_number} | Support</title>
      </Head>

      <div className="min-h-screen bg-transparent">
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au support
            </Link>
            <h1 className="font-heading text-xl text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-gold" />
              {ticket.ticket_number} — {ticket.subject}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {ticket.customer_email || ticket.customer_name || '—'} · Créé le{' '}
              {new Date(ticket.created_at).toLocaleString('fr-FR')}
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-white/70 text-sm">Statut :</label>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-gold"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-sm">
                  {ticket.customer_name || ticket.customer_email || 'Client'} · Message initial
                </p>
                <p className="text-white mt-2 whitespace-pre-wrap">{ticket.message}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg text-white">Réponses ({replies.length})</h2>
            {replies.length === 0 && (
              <p className="text-white/50 text-sm">Aucune réponse pour l&apos;instant.</p>
            )}
            {replies.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-refined p-4 border ${
                  r.is_staff ? 'bg-gold/10 border-gold/30' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {r.is_staff ? (
                    <Headphones className="w-4 h-4 text-gold" />
                  ) : (
                    <User className="w-4 h-4 text-white/50" />
                  )}
                  <span className="text-white/80 text-sm font-medium">
                    {r.author_name || (r.is_staff ? 'Équipe' : 'Client')}
                  </span>
                  <span className="text-white/50 text-xs">
                    {new Date(r.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-white whitespace-pre-wrap">{r.message}</p>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSendReply} className="bg-white/5 backdrop-blur-xl rounded-refined p-6 border border-white/10">
            <label className="block text-white/80 font-medium mb-2">Répondre au ticket</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Votre réponse..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gold text-charcoal rounded-lg font-medium hover:bg-gold/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </main>
      </div>
    </AdminLayout>
  );
}
