/**
 * Dashboard Client EcamSap - Vêtements de seconde main
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  MapPin,
  Heart,
  User,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ECAMSAP } from '../lib/ecamsap';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);

  // Données
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setMounted(true);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      // Utiliser les données locales d'abord
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (e) {
          console.error('Erreur parsing user:', e);
        }
      }

      // Charger commandes (ne pas bloquer le chargement si ça échoue)
      loadOrders().catch((err) => {
        console.error('Erreur chargement commandes:', err);
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur de chargement');
      if (error.response?.status === 401) {
        router.push('/login');
      }
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('auth_token')) : null;
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/ecommerce/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      // Ne pas afficher d'erreur à l'utilisateur si c'est juste les commandes qui ne chargent pas
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Déconnexion réussie');
    router.push('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'text-green-500';
      case 'pending':
      case 'processing':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      completed: 'Terminée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-offwhite">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mon Compte | {ECAMSAP.name}</title>
        <meta name="description" content="Gérez votre compte EcamSap" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-sage/10">
        {/* Header */}
        <header className="border-b border-pearl/20 bg-charcoal/50 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-heading text-2xl text-offwhite">
                {ECAMSAP.name}
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/products" className="text-offwhite/70 hover:text-offwhite transition-colors">
                  Boutique
                </Link>
                <Link href="/cart" className="text-offwhite/70 hover:text-offwhite transition-colors">
                  Panier
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-offwhite/70 hover:text-gold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="font-heading text-3xl text-offwhite mb-2">
                Bonjour, {user?.firstname || user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-offwhite/60">Bienvenue sur votre espace personnel</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6 sticky top-6">
                  <div className="mb-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gold to-sage rounded-full mx-auto mb-4 flex items-center justify-center text-charcoal font-bold text-2xl">
                      {user?.firstname?.charAt(0) || 'U'}
                    </div>
                    <h3 className="font-heading text-lg text-offwhite">{user?.name || user?.email}</h3>
                    <p className="text-sm text-offwhite/60">{user?.email}</p>
                  </div>

                  <nav className="space-y-2">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'overview'
                          ? 'bg-gold text-charcoal font-medium'
                          : 'text-offwhite hover:bg-white/10'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Vue d'ensemble</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'orders'
                          ? 'bg-gold text-charcoal font-medium'
                          : 'text-offwhite hover:bg-white/10'
                      }`}
                    >
                      <Package className="w-5 h-5" />
                      <span>Mes commandes</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'addresses'
                          ? 'bg-gold text-charcoal font-medium'
                          : 'text-offwhite hover:bg-white/10'
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Adresses</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'wishlist'
                          ? 'bg-gold text-charcoal font-medium'
                          : 'text-offwhite hover:bg-white/10'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Mes favoris</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === 'profile'
                          ? 'bg-gold text-charcoal font-medium'
                          : 'text-offwhite hover:bg-white/10'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mon profil</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Vue d'ensemble */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Package className="w-8 h-8 text-gold" />
                        </div>
                        <h3 className="text-2xl font-bold text-offwhite">{orders.length}</h3>
                        <p className="text-offwhite/60 text-sm">Commandes totales</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Truck className="w-8 h-8 text-sage" />
                        </div>
                        <h3 className="text-2xl font-bold text-offwhite">
                          {orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length}
                        </h3>
                        <p className="text-offwhite/60 text-sm">En cours</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Heart className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-offwhite">{wishlist.length}</h3>
                        <p className="text-offwhite/60 text-sm">Favoris</p>
                      </div>
                    </div>

                    {/* Dernières commandes */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-xl text-offwhite">Dernières commandes</h2>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-gold hover:text-gold/80 text-sm flex items-center gap-1"
                        >
                          Voir tout
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-offwhite/20 mx-auto mb-4" />
                          <p className="text-offwhite/60 mb-4">Aucune commande pour le moment</p>
                          <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-charcoal rounded-refined font-medium hover:bg-gold/90 transition-all"
                          >
                            <ShoppingBag className="w-5 h-5" />
                            Découvrir la boutique
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 3).map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-pearl/10"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                </div>
                                <div>
                                  <p className="text-offwhite font-medium">Commande #{order.order_number}</p>
                                  <p className="text-offwhite/60 text-sm">
                                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-offwhite font-bold">{order.total_amount}€</p>
                                <p className={`text-sm ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mes commandes */}
                {activeTab === 'orders' && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                    <h2 className="font-heading text-xl text-offwhite mb-6">Mes commandes</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-offwhite/20 mx-auto mb-4" />
                        <p className="text-offwhite/60">Aucune commande</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-pearl/10"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-offwhite font-bold text-lg">#{order.order_number}</h3>
                                <p className="text-offwhite/60 text-sm">
                                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                  order.status === 'completed' || order.status === 'delivered'
                                    ? 'bg-green-500/20 text-green-400'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-offwhite/80">
                                <p className="text-sm">Montant total</p>
                                <p className="text-2xl font-bold text-offwhite">{order.total_amount}€</p>
                              </div>
                              <Link
                                href={`/orders/${order.id}`}
                                className="px-6 py-2 bg-gold/20 text-gold rounded-refined font-medium hover:bg-gold/30 transition-all"
                              >
                                Détails
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Autres tabs */}
                {activeTab === 'addresses' && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                    <h2 className="font-heading text-xl text-offwhite mb-6">Mes adresses</h2>
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-offwhite/20 mx-auto mb-4" />
                      <p className="text-offwhite/60">Fonctionnalité en cours de développement</p>
                    </div>
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                    <h2 className="font-heading text-xl text-offwhite mb-6">Mes favoris</h2>
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-offwhite/20 mx-auto mb-4" />
                      <p className="text-offwhite/60">Aucun favori pour le moment</p>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-refined border border-pearl/20 p-6">
                    <h2 className="font-heading text-xl text-offwhite mb-6">Mon profil</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-offwhite/60 mb-2">Nom complet</label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          disabled
                          className="w-full px-4 py-3 bg-white/10 border border-pearl/20 rounded-refined text-offwhite"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-offwhite/60 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-3 bg-white/10 border border-pearl/20 rounded-refined text-offwhite"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-offwhite/60 mb-2">Téléphone</label>
                        <input
                          type="tel"
                          value={user?.phone || ''}
                          disabled
                          className="w-full px-4 py-3 bg-white/10 border border-pearl/20 rounded-refined text-offwhite"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
