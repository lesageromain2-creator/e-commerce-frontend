/**
 * Page Checkout avec Stripe
 * Redirection vers Stripe Checkout
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'react-toastify';
import { EcommerceLayout } from '@/components/ecommerce';
import { Loader2, CreditCard, Lock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutStripePage() {
  const router = useRouter();
  const { items, cart, fetchCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR',
  });

  const [billingForm, setBillingForm] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  useEffect(() => {
    fetchCart().finally(() => setLoading(false));
  }, [fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    // Validation
    if (!shippingForm.firstName || !shippingForm.lastName || !shippingForm.email || !shippingForm.address || !shippingForm.city || !shippingForm.postalCode) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setProcessing(true);

    try {
      // Préparer les adresses
      const shippingAddress = {
        first_name: shippingForm.firstName,
        last_name: shippingForm.lastName,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address_line1: shippingForm.address,
        city: shippingForm.city,
        postal_code: shippingForm.postalCode,
        country: shippingForm.country,
      };

      const billingAddress = sameAsShipping
        ? shippingAddress
        : {
            first_name: billingForm.firstName,
            last_name: billingForm.lastName,
            email: billingForm.email,
            phone: billingForm.phone,
            address_line1: billingForm.address,
            city: billingForm.city,
            postal_code: billingForm.postalCode,
            country: billingForm.country,
          };

      // Créer la session Stripe Checkout
      const response = await axios.post(
        `${API_URL}/stripe/create-checkout`,
        {
          cartId: cart?.id,
          shippingAddress,
          billingAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success && response.data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = response.data.url;
      } else {
        toast.error('Erreur lors de la création de la session de paiement');
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Erreur checkout:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <EcommerceLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
        </div>
      </EcommerceLayout>
    );
  }

  if (items.length === 0) {
    return (
      <EcommerceLayout>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="font-heading text-h1 text-charcoal mb-4">Panier vide</h1>
          <p className="text-body text-charcoal/70 mb-8">Ajoutez des produits pour continuer</p>
          <button onClick={() => router.push('/products')} className="btn-primary">
            Voir les produits
          </button>
        </div>
      </EcommerceLayout>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Calculé par Stripe ou gratuit
  const total = subtotal + shipping;

  return (
    <>
      <Head>
        <title>Paiement sécurisé | Atelier Vintage</title>
        <meta name="robots" content="noindex" />
      </Head>

      <EcommerceLayout>
        <div className="max-w-6xl mx-auto px-6 lg:px-20 py-12">
          <h1 className="font-heading text-h1 text-charcoal mb-8">Paiement sécurisé</h1>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Adresse de livraison */}
                <section>
                  <h2 className="font-heading text-h3 text-charcoal mb-4">Adresse de livraison</h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Prénom *"
                        value={shippingForm.firstName}
                        onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                        required
                        className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                      <input
                        type="text"
                        placeholder="Nom *"
                        value={shippingForm.lastName}
                        onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                        required
                        className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email *"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      required
                      className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <input
                      type="text"
                      placeholder="Adresse *"
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      required
                      className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Ville *"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        required
                        className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                      <input
                        type="text"
                        placeholder="Code postal *"
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                        required
                        className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <select
                      value={shippingForm.country}
                      onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                      className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="LU">Luxembourg</option>
                      <option value="MC">Monaco</option>
                    </select>
                  </div>
                </section>

                {/* Adresse de facturation */}
                <section>
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 text-gold focus:ring-gold border-pearl rounded"
                    />
                    <span className="text-body text-charcoal">Identique à l'adresse de livraison</span>
                  </label>

                  {!sameAsShipping && (
                    <>
                      <h2 className="font-heading text-h3 text-charcoal mb-4">Adresse de facturation</h2>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Prénom *"
                            value={billingForm.firstName}
                            onChange={(e) => setBillingForm({ ...billingForm, firstName: e.target.value })}
                            required={!sameAsShipping}
                            className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                          <input
                            type="text"
                            placeholder="Nom *"
                            value={billingForm.lastName}
                            onChange={(e) => setBillingForm({ ...billingForm, lastName: e.target.value })}
                            required={!sameAsShipping}
                            className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>
                        <input
                          type="email"
                          placeholder="Email *"
                          value={billingForm.email}
                          onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                          required={!sameAsShipping}
                          className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                        <input
                          type="text"
                          placeholder="Adresse *"
                          value={billingForm.address}
                          onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                          required={!sameAsShipping}
                          className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Ville *"
                            value={billingForm.city}
                            onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                            required={!sameAsShipping}
                            className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                          <input
                            type="text"
                            placeholder="Code postal *"
                            value={billingForm.postalCode}
                            onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                            required={!sameAsShipping}
                            className="px-4 py-3 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </section>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirection vers Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Payer avec Stripe
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-small text-charcoal/60">
                  <Lock className="w-4 h-4" />
                  Paiement 100% sécurisé par Stripe
                </div>
              </form>
            </div>

            {/* Récapitulatif */}
            <div>
              <div className="bg-pearl/30 rounded-refined p-6 sticky top-24">
                <h2 className="font-heading text-h3 text-charcoal mb-4">Récapitulatif</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.productId + (item.variantId || '')} className="flex gap-3">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-refined"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-small font-medium text-charcoal truncate">{item.name}</p>
                        {item.variantName && <p className="text-caption text-charcoal/60">{item.variantName}</p>}
                        <p className="text-caption text-charcoal/60">Qté: {item.quantity}</p>
                      </div>
                      <p className="text-small font-semibold text-charcoal">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-pearl pt-4 space-y-2">
                  <div className="flex justify-between text-body">
                    <span className="text-charcoal/70">Sous-total</span>
                    <span className="font-semibold text-charcoal">{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-body">
                    <span className="text-charcoal/70">Livraison</span>
                    <span className="font-semibold text-charcoal">{shipping === 0 ? 'Calculé après' : `${shipping.toFixed(2)} €`}</span>
                  </div>
                  <div className="flex justify-between text-h3 font-heading border-t border-pearl pt-2">
                    <span className="text-charcoal">Total</span>
                    <span className="text-gold">{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EcommerceLayout>
    </>
  );
}
