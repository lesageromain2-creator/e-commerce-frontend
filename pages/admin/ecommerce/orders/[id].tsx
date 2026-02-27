/**
 * Page Admin - Détail commande
 * /admin/ecommerce/orders/[id]
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface OrderItem {
  id: string;
  product_name: string;
  variant_name?: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url: string;
}

interface Order {
  id: string;
  order_number: string;
  guest_email: string;
  billing_address: any;
  shipping_address: any;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_method: string;
  tracking_number?: string;
  customer_note?: string;
  admin_note?: string;
  created_at: string;
  items: OrderItem[];
  statusHistory: any[];
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      // Mock data détaillée
      const mockOrder: Order = {
        id: id as string,
        order_number: 'ORD-20250209-0001',
        guest_email: 'client@example.com',
        billing_address: {
          firstName: 'Jean',
          lastName: 'Dupont',
          addressLine1: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'FR',
          phone: '+33 6 12 34 56 78',
        },
        shipping_address: {
          firstName: 'Jean',
          lastName: 'Dupont',
          addressLine1: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'FR',
          phone: '+33 6 12 34 56 78',
        },
        subtotal: 149.99,
        shipping_cost: 5.99,
        tax_amount: 31.20,
        discount_amount: 0,
        total_amount: 187.18,
        status: 'processing',
        payment_status: 'paid',
        payment_method: 'stripe',
        shipping_method: 'standard',
        created_at: new Date().toISOString(),
        items: [
          {
            id: '1',
            product_name: 'Smartphone XYZ',
            sku: 'PHONE-001',
            price: 149.99,
            quantity: 1,
            subtotal: 149.99,
            image_url: '/placeholder.png',
          },
        ],
        statusHistory: [
          {
            from_status: 'pending',
            to_status: 'processing',
            comment: 'Paiement confirmé',
            created_at: new Date().toISOString(),
          },
          {
            to_status: 'pending',
            comment: 'Commande créée',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      };

      setOrder(mockOrder);
      setAdminNote(mockOrder.admin_note || '');
      setTrackingNumber(mockOrder.tracking_number || '');
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      await axios.patch(
        `${API_URL}/ecommerce/orders/${order.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success('Statut mis à jour');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Commande {order.order_number} | Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Commande {order.order_number}
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date(order.created_at).toLocaleDateString('fr-FR')} à{' '}
                {new Date(order.created_at).toLocaleTimeString('fr-FR')}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer facture
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Produits */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Produits commandés</h2>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <img
                        src={item.image_url || '/placeholder.png'}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product_name}</h3>
                        {item.variant_name && (
                          <p className="text-sm text-gray-500">{item.variant_name}</p>
                        )}
                        <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span>{item.price.toFixed(2)}€ x {item.quantity}</span>
                          <span className="font-bold">{item.subtotal.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{order.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">{order.shipping_cost.toFixed(2)}€</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Réduction {order.coupon_code && `(${order.coupon_code})`}
                      </span>
                      <span className="font-medium text-green-600">
                        -{order.discount_amount.toFixed(2)}€
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (20%)</span>
                    <span className="font-medium">{order.tax_amount.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{order.total_amount.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Adresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold mb-3">Adresse de facturation</h3>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.billing_address.firstName} {order.billing_address.lastName}
                    </p>
                    <p>{order.billing_address.addressLine1}</p>
                    {order.billing_address.addressLine2 && (
                      <p>{order.billing_address.addressLine2}</p>
                    )}
                    <p>
                      {order.billing_address.postalCode} {order.billing_address.city}
                    </p>
                    <p>{order.billing_address.country}</p>
                    <p className="text-gray-600">{order.billing_address.phone}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold mb-3">Adresse de livraison</h3>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </p>
                    <p>{order.shipping_address.addressLine1}</p>
                    {order.shipping_address.addressLine2 && (
                      <p>{order.shipping_address.addressLine2}</p>
                    )}
                    <p>
                      {order.shipping_address.postalCode} {order.shipping_address.city}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    <p className="text-gray-600">{order.shipping_address.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Statut */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold mb-4">Gestion commande</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Statut commande</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Statut paiement</label>
                    <div className={`px-4 py-2 rounded-lg font-medium ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Numéro de suivi</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Entrer le numéro..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    <button
                      onClick={() => {
                        // TODO: Implémenter sauvegarde tracking
                        toast.success('Numéro de suivi enregistré');
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Note admin</label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={4}
                      placeholder="Note interne..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    <button
                      onClick={() => {
                        // TODO: Implémenter sauvegarde note
                        toast.success('Note enregistrée');
                      }}
                      className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Enregistrer la note
                    </button>
                  </div>
                </div>
              </div>

              {/* Info client */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold mb-4">Informations client</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Email</span>
                    <p className="font-medium">{order.guest_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Téléphone</span>
                    <p className="font-medium">{order.billing_address.phone}</p>
                  </div>
                  {order.customer_note && (
                    <div>
                      <span className="text-gray-600">Note du client</span>
                      <p className="mt-1 p-3 bg-gray-50 rounded">{order.customer_note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Historique */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold mb-4">Historique</h3>
                
                <div className="space-y-4">
                  {order.statusHistory.map((entry, index) => (
                    <div key={index} className="relative pl-6 pb-4 last:pb-0">
                      <div className="absolute left-0 top-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                      {index < order.statusHistory.length - 1 && (
                        <div className="absolute left-1.5 top-4 w-0.5 h-full bg-gray-200"></div>
                      )}
                      <div className="text-sm">
                        <p className="font-medium">
                          {entry.from_status && `${entry.from_status} → `}
                          {entry.to_status}
                        </p>
                        {entry.comment && (
                          <p className="text-gray-600">{entry.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
