/**
 * Page Checkout E-commerce
 * Formulaire adresse puis redirection vers la page de paiement Stripe (hébergée par Stripe, personnalisable dans le Dashboard).
 * /checkout
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCartStore } from '@/lib/cart-store';
import axios from 'axios';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { EcommerceLayout } from '@/components/ecommerce';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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
      setRedirecting(true);

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const stripeResponse = await axios.post(`${API_URL}/stripe/create-checkout-from-order`, {
        orderId: order.id,
        successUrl: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout`,
      });

      if (stripeResponse.data.success && stripeResponse.data.url) {
        window.location.href = stripeResponse.data.url;
        return;
      }
      throw new Error('Impossible d\'ouvrir la page de paiement');
    } catch (error: any) {
      console.error('Error creating order or checkout session:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
      setRedirecting(false);
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
        <title>Paiement | Atelier Vintage</title>
      </Head>

      <EcommerceLayout>
        <div className="max-w-grid mx-auto px-6 lg:px-20 py-12">
          <h1 className="font-heading text-h1 text-charcoal mb-10">Finaliser la commande</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="border border-pearl rounded-refined bg-offwhite p-6 lg:p-8">
                <h2 className="font-heading text-h2 text-charcoal mb-6">Informations de livraison</h2>

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
                          className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                          className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                          className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                          className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                        className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                        className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                          className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                          className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
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
                        className="w-full px-4 py-2.5 border border-pearl rounded-refined bg-offwhite focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold text-charcoal"
                      >
                        <option value="FR">France</option>
                        <option value="BE">Belgique</option>
                        <option value="CH">Suisse</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateOrder}
                    disabled={loading || redirecting}
                    className="w-full mt-6 btn-primary disabled:opacity-50"
                  >
                    {redirecting
                      ? 'Redirection vers le paiement sécurisé...'
                      : loading
                        ? 'Création de la commande...'
                        : 'Continuer vers le paiement (Stripe)'}
                  </button>
                </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-pearl rounded-refined bg-pearl/20 p-6 sticky top-24">
                <h2 className="font-heading text-h2 text-charcoal mb-4">Récapitulatif</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-refined" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-small text-charcoal">{item.name}</h4>
                        {item.variantName && <p className="text-caption text-charcoal/60">{item.variantName}</p>}
                        <p className="text-small">{item.quantity} × {item.price.toFixed(2)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-pearl pt-4 space-y-2 text-small">
                  <div className="flex justify-between"><span className="text-charcoal/70">Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
                  <div className="flex justify-between"><span className="text-charcoal/70">Livraison</span><span>{shipping === 0 ? <span className="text-sage">Gratuite</span> : `${shipping.toFixed(2)} €`}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal/70">TVA</span><span>{tax.toFixed(2)} €</span></div>
                </div>
                <div className="border-t border-pearl pt-4 mt-4 flex justify-between font-semibold text-lg text-charcoal">
                  <span>Total</span><span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EcommerceLayout>
    </>
  );
}
