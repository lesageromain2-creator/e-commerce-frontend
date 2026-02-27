/**
 * Page d'inscription EcamSap - Authentification JWT simple
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowRight, Home } from 'lucide-react';
import { register } from '../utils/api';
import { toast } from 'react-toastify';
import { ECAMSAP } from '../lib/ecamsap';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Rediriger si déjà connecté
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Faible';
    if (passwordStrength < 60) return 'Moyen';
    if (passwordStrength < 80) return 'Bon';
    return 'Excellent';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password
      });

      toast.success('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
      await router.push('/login');
      
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la création du compte';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Créer un compte | {ECAMSAP.name}</title>
        <meta name="description" content={`Créez votre compte ${ECAMSAP.name}`} />
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
                <UserPlus className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-heading text-2xl text-charcoal mb-2">Créer un compte</h2>
              <p className="text-small text-charcoal/60">Rejoignez la communauté EcamSap</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-charcoal mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="Prénom"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-pearl rounded-refined text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-charcoal mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    placeholder="Nom"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-pearl rounded-refined text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all disabled:opacity-50"
                  />
                </div>
              </div>

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
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-pearl rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs text-charcoal/60 font-medium">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-pearl rounded-refined text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all disabled:opacity-50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-pearl text-gold focus:ring-gold focus:ring-offset-0"
                  />
                  <span className="text-sm text-charcoal/70">
                    J'accepte les{' '}
                    <Link href="/conditions-service" className="text-gold hover:text-gold/80 font-medium">
                      conditions d'utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link href="/confidentialite" className="text-gold hover:text-gold/80 font-medium">
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full py-3.5 bg-gold text-charcoal rounded-refined font-medium hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Créer mon compte
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-pearl text-center">
              <p className="text-small text-charcoal/60">
                Vous avez déjà un compte?{' '}
                <Link href="/login" className="text-gold hover:text-gold/80 font-medium inline-flex items-center gap-1 transition-colors">
                  Se connecter
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
            <p>🔒 Inscription sécurisée • Vos données sont protégées</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
