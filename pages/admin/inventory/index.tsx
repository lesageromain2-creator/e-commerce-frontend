/**
 * Page Admin - Gestion de l'inventaire
 * /admin/inventory
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Package, AlertTriangle, TrendingDown, DollarSign,
  Search, Filter, Download, Upload, Plus, Minus, Edit2
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface InventoryStats {
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  price: number;
  category_name?: string;
  brand_name?: string;
  featured_image: string;
}

interface InventoryMovement {
  id: string;
  product_name: string;
  variant_name?: string;
  type: string;
  quantity: number;
  reference?: string;
  note?: string;
  admin_name?: string;
  created_at: string;
}

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'adjust'>('overview');
  
  // Pour l'ajustement de stock
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustType, setAdjustType] = useState('adjustment');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustReference, setAdjustReference] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsRes, lowStockRes, movementsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/inventory/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/inventory/low-stock?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/inventory/movements?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (lowStockRes.data.success) setLowStockProducts(lowStockRes.data.products);
      if (movementsRes.data.success) setRecentMovements(movementsRes.data.movements);
    } catch (error) {
      console.error('Erreur chargement inventaire:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustProduct || adjustQuantity === 0) {
      toast.error('Veuillez sélectionner un produit et entrer une quantité');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/inventory/adjust`,
        {
          productId: adjustProduct.id,
          quantity: adjustQuantity,
          type: adjustType,
          note: adjustNote,
          reference: adjustReference,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Stock ajusté avec succès');
      setAdjustProduct(null);
      setAdjustQuantity(0);
      setAdjustNote('');
      setAdjustReference('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajustement');
    }
  };

  const getMovementBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      sale: { label: 'Vente', className: 'bg-blue-500/20 text-blue-300' },
      restock: { label: 'Réappro', className: 'bg-green-500/20 text-green-300' },
      adjustment: { label: 'Ajustement', className: 'bg-purple-500/20 text-purple-300' },
      return: { label: 'Retour', className: 'bg-yellow-500/20 text-yellow-300' },
      damaged: { label: 'Endommagé', className: 'bg-red-500/20 text-red-300' },
      lost: { label: 'Perdu', className: 'bg-gray-500/20 text-gray-300' },
    };
    const badge = badges[type] || { label: type, className: 'bg-white/10 text-white/60' };
    return (
      <span className={`px-2 py-1 rounded-capsule text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const statCards = [
    {
      title: 'Valeur totale',
      value: `${(stats?.totalValue || 0).toFixed(2)} €`,
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    },
    {
      title: 'Produits',
      value: stats?.totalProducts || 0,
      subtitle: 'Total en stock',
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      title: 'Stock faible',
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
    },
    {
      title: 'Rupture',
      value: stats?.outOfStockCount || 0,
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Inventaire | Admin</title>
      </Head>

      <div className="min-h-screen bg-transparent">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl text-white">Gestion de l'inventaire</h1>
                <p className="text-small text-white/60 mt-1">Suivi du stock et mouvements</p>
              </div>
              <div className="flex gap-3">
                <button className="text-xs px-3 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
                <button className="text-xs px-3 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Importer
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Stats */}
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
                  </div>
                  <p className="text-small text-white/60 mb-1">{card.title}</p>
                  <p className="font-heading text-2xl font-semibold text-white">{card.value}</p>
                  {card.subtitle && <p className="text-xs text-white/50 mt-1">{card.subtitle}</p>}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tabs */}
          <div className="border-b border-white/10">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('movements')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'movements'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                Mouvements
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'adjust'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                Ajuster le stock
              </button>
            </div>
          </div>

          {/* Contenu selon tab */}
          {activeTab === 'overview' && (
            <section>
              <h2 className="font-heading text-xl text-white mb-4">Produits à faible stock</h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Produit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Seuil</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Valeur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {lowStockProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.featured_image || '/placeholder.png'}
                                alt={product.name}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                              <div>
                                <p className="text-small font-medium text-white">{product.name}</p>
                                <p className="text-xs text-white/50">{product.category_name || 'Sans catégorie'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-small text-white">{product.sku}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-capsule text-xs font-medium ${
                              product.stock_quantity === 0
                                ? 'bg-red-500/20 text-red-300'
                                : product.stock_quantity <= product.low_stock_threshold
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-green-500/20 text-green-300'
                            }`}>
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-small text-white/60">{product.low_stock_threshold}</td>
                          <td className="px-6 py-4 text-small font-medium text-white">
                            {(product.price * product.stock_quantity).toFixed(2)} €
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setAdjustProduct(product);
                                setActiveTab('adjust');
                              }}
                              className="text-gold hover:text-gold/80 text-xs flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Ajuster
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'movements' && (
            <section>
              <h2 className="font-heading text-xl text-white mb-4">Mouvements récents</h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Produit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Quantité</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Référence</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {recentMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-small text-white/60">
                            {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-small text-white">
                            {movement.product_name}
                            {movement.variant_name && (
                              <span className="text-white/50"> - {movement.variant_name}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">{getMovementBadge(movement.type)}</td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${movement.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-small text-white/60">{movement.reference || '-'}</td>
                          <td className="px-6 py-4 text-small text-white/60">{movement.admin_name || 'Système'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'adjust' && (
            <section>
              <h2 className="font-heading text-xl text-white mb-4">Ajuster le stock</h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-white/10 p-6 max-w-2xl">
                <div className="space-y-4">
                  {adjustProduct ? (
                    <div className="bg-white/5 rounded-md p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={adjustProduct.featured_image || '/placeholder.png'}
                          alt={adjustProduct.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium text-white">{adjustProduct.name}</p>
                          <p className="text-xs text-white/50">Stock actuel: {adjustProduct.stock_quantity}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdjustProduct(null)}
                        className="text-white/60 hover:text-white text-xs"
                      >
                        Changer
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Rechercher un produit</label>
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou SKU..."
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Type d'ajustement</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="adjustment">Ajustement</option>
                      <option value="restock">Réapprovisionnement</option>
                      <option value="damaged">Produit endommagé</option>
                      <option value="lost">Produit perdu</option>
                      <option value="return">Retour client</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Quantité</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAdjustQuantity(Math.max(adjustQuantity - 1, -999))}
                        className="p-2 bg-white/10 rounded-md hover:bg-white/20 transition"
                      >
                        <Minus className="w-5 h-5 text-white" />
                      </button>
                      <input
                        type="number"
                        value={adjustQuantity}
                        onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                      <button
                        onClick={() => setAdjustQuantity(adjustQuantity + 1)}
                        className="p-2 bg-white/10 rounded-md hover:bg-white/20 transition"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      Utilisez des nombres négatifs pour réduire le stock
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Référence (optionnel)</label>
                    <input
                      type="text"
                      value={adjustReference}
                      onChange={(e) => setAdjustReference(e.target.value)}
                      placeholder="N° bon de livraison, facture..."
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Note (optionnel)</label>
                    <textarea
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      placeholder="Raison de l'ajustement..."
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <button
                    onClick={handleAdjustStock}
                    disabled={!adjustProduct || adjustQuantity === 0}
                    className="w-full py-3 bg-gold text-charcoal rounded-md font-medium hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer l'ajustement
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
