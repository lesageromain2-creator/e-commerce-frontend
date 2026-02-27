/**
 * Page de récupération de mot de passe EcamSap
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ECAMSAP } from '../lib/ecamsap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      setEmailSent(true);
      toast.success('Email de récupération envoyé! Vérifiez votre boîte de réception.');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mot de passe oublié | {ECAMSAP.name}</title>
        <meta name="description" content="Récupérez votre mot de passe" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-sage/20 flex items-center justify-center p-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-sage/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="font-heading text-3xl text-offwhite tracking-tight">
                {ECAMSAP.name}
              </h1>
              <p className="text-small text-charcoal/60 mt-1">{ECAMSAP.slogan}</p>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-offwhite/95 backdrop-blur-xl rounded-refined p-8 shadow-refined border border-pearl">
            {!emailSent ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-gold" />
                  </div>
                  <h2 className="font-heading text-2xl text-charcoal mb-2">Mot de passe oublié?</h2>
                  <p className="text-small text-charcoal/60">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-pearl rounded-refined text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gold text-charcoal rounded-refined font-medium hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer le lien
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-heading text-2xl text-charcoal mb-2">Email envoyé!</h2>
                <p className="text-small text-charcoal/60 mb-6">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
                </p>
                <p className="text-xs text-charcoal/50">
                  Vérifiez votre boîte de réception et vos spams.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-pearl text-center">
              <Link href="/login" className="text-gold hover:text-gold/80 font-medium inline-flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>

          {/* Info supplémentaire */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-center text-small text-offwhite/60"
          >
            <p>🔒 Récupération sécurisée • Vos données sont protégées</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
