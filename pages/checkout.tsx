/**
 * Page Checkout E-commerce avec Stripe Elements
 * /checkout
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '@/lib/cart-store';
import axios from 'axios';
import { toast } from 'react-toastify';
import { z } from 'zod';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Schema de validation
const addressSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  addressLine1: z.string().min(1, 'Adresse requise'),
  city: z.string().min(1, 'Ville requise'),
  postalCode: z.string().min(1, 'Code postal requis'),
  country: z.string().length(2, 'Code pays invalide'),
  phone: z.string().min(1, 'Téléphone requis'),
  email: z.string().email('Email invalide'),
});

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, clearCart, getSubtotal } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/success`,
      },
    });

    if (error) {
      setMessage(error.message || 'Une erreur est survenue');
      toast.error(error.message);
    } else {
      // La redirection se fera automatiquement vers return_url
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Traitement...' : `Payer ${getSubtotal().toFixed(2)}€`}
      </button>

      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {message}
        </div>
      )}
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getItemCount } = useCartStore();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'FR',
  });

  const [shippingAddress, setShippingAddress] = useState({ ...billingAddress });
  const [sameAsShipping, setSameAsShipping] = useState(true);

  useEffect(() => {
    // Rediriger si panier vide
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items]);

  const validateAddress = () => {
    try {
      addressSchema.parse(billingAddress);
      if (!sameAsShipping) {
        addressSchema.parse(shippingAddress);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleCreateOrder = async () => {
    if (!validateAddress()) return;

    setLoading(true);

    try {
      // Créer la commande
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        billingAddress,
        shippingAddress: sameAsShipping ? billingAddress : shippingAddress,
      };

      const orderResponse = await axios.post(`${API_URL}/ecommerce/orders`, orderData);

      if (!orderResponse.data.success) {
        throw new Error('Erreur lors de la création de la commande');
      }

      const order = orderResponse.data.order;
      setOrderId(order.id);

      // Créer PaymentIntent
      const paymentResponse = await axios.post(`${API_URL}/payments/order-intent`, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: parseFloat(order.totalAmount),
        customerEmail: billingAddress.email,
        customerName: `${billingAddress.firstName} ${billingAddress.lastName}`,
      });

      if (paymentResponse.data.success) {
        setClientSecret(paymentResponse.data.clientSecret);
        setStep('payment');
      } else {
        throw new Error('Erreur lors de la création du paiement');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = (subtotal + shipping) * 0.20;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Paiement | VotreShop</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold">Finaliser la commande</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center ${step === 'address' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className="w-8 h-8 rounded-full bg-current text-white flex items-center justify-center font-bold text-sm">
                  {step === 'address' ? '1' : '✓'}
                </div>
                <span className="ml-2 font-medium">Adresse</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className={`flex items-center ${step === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full bg-current text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="ml-2 font-medium">Paiement</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              {step === 'address' ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">Informations de livraison</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Prénom *</label>
                        <input
                          type="text"
                          value={billingAddress.firstName}
                          onChange={(e) =>
                            setBillingAddress({ ...billingAddress, firstName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nom *</label>
                        <input
                          type="text"
                          value={billingAddress.lastName}
                          onChange={(e) =>
                            setBillingAddress({ ...billingAddress, lastName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input
                          type="email"
                          value={billingAddress.email}
                          onChange={(e) =>
                            setBillingAddress({ ...billingAddress, email: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Téléphone *</label>
                        <input
                          type="tel"
                          value={billingAddress.phone}
                          onChange={(e) =>
                            setBillingAddress({ ...billingAddress, phone: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Adresse *</label>
                      <input
                        type="text"
                        value={billingAddress.addressLine1}
                        onChange={(e) =>
                          setBillingAddress({ ...billingAddress, addressLine1: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Complément d'adresse</label>
                      <input
                        type="text"
                        value={billingAddress.addressLine2}
                        onChange={(e) =>
                          setBillingAddress({ ...billingAddress, addressLine2: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Code postal *</label>
                        <input
                          type="text"
                          value={billingAddress.postalCode}
                          onChange={(e) =>
                            setBillingAddress({ ...billingAddress, postalCode: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Ville *</label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) =>
                            setBillingAddress({ ...billingAddress, city: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Pays *</label>
                      <select
                        value={billingAddress.country}
                        onChange={(e) =>
                          setBillingAddress({ ...billingAddress, country: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="FR">France</option>
                        <option value="BE">Belgique</option>
                        <option value="CH">Suisse</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Création...' : 'Continuer vers le paiement'}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">Paiement sécurisé</h2>
                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm clientSecret={clientSecret} />
                    </Elements>
                  )}
                </div>
              )}
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        {item.variantName && (
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                        )}
                        <p className="text-sm">
                          {item.quantity} x {item.price.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Gratuite</span>
                      ) : (
                        `${shipping.toFixed(2)}€`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA</span>
                    <span className="font-medium">{tax.toFixed(2)}€</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{total.toFixed(2)}€</span>
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
