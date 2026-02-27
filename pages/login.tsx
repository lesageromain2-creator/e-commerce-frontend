/**
 * Page de connexion EcamSap - Authentification JWT simple
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Home } from 'lucide-react';
import { login } from '../utils/api';
import { toast } from 'react-toastify';
import { ECAMSAP } from '../lib/ecamsap';

export default function LoginPage() {
  const router = useRouter();
  const { redirect } = router.query;
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Rediriger si déjà connecté (token persistant)
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      router.push((redirect as string) || '/dashboard');
    }
  }, [redirect, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      // Redirection selon le paramètre URL ou le rôle
      let destination: string;
      
      // Priorité 1: Respecter le paramètre redirect de l'URL
      if (redirect && typeof redirect === 'string') {
        destination = redirect;
        console.log('✅ Redirection vers URL spécifiée:', destination);
      } 
      // Priorité 2: Rediriger selon le rôle
      else {
        const role = response.user?.role;
        if (role === 'admin') {
          destination = '/admin/ecommerce/dashboard';
        } else if (role === 'dropshipper') {
          destination = '/dropshipper/dashboard';
        } else {
          destination = '/dashboard';
        }
        console.log('✅ Redirection selon rôle:', role, '→', destination);
      }

      toast.success('Connexion réussie!');
      await router.push(destination);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Email ou mot de passe incorrect';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Connexion | {ECAMSAP.name}</title>
        <meta name="description" content={`Connectez-vous à votre compte ${ECAMSAP.name}`} />
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
          {/* Retour accueil */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-refined border border-offwhite/30 text-offwhite/90 hover:bg-offwhite/10 hover:text-offwhite text-sm font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </div>

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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
                <LogIn className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-heading text-2xl text-charcoal mb-2">Bon retour</h2>
              <p className="text-small text-charcoal/60">Connectez-vous à votre compte</p>
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white border border-pearl rounded-refined text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-pearl rounded-refined text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all disabled:opacity-50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-pearl text-gold focus:ring-gold focus:ring-offset-0"
                  />
                  <span className="text-charcoal/70">Se souvenir de moi</span>
                </label>
                <Link href="/forgot-password" className="text-gold hover:text-gold/80 font-medium transition-colors">
                  Mot de passe oublié?
                </Link>
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
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-pearl text-center">
              <p className="text-small text-charcoal/60">
                Pas encore de compte?{' '}
                <Link href="/register" className="text-gold hover:text-gold/80 font-medium inline-flex items-center gap-1 transition-colors">
                  Créer un compte
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
          </div>

          {/* Info supplémentaire */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-center text-small text-offwhite/60"
          >
            <p>🔒 Connexion sécurisée • Vos données sont protégées</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
