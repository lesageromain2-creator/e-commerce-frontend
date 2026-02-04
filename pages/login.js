// frontend/pages/login.js - Style hôtel luxe
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { login, fetchSettings } from '../utils/api';
import { authClient } from '../lib/auth-client';
import { DEFAULT_HOTEL } from '../lib/hotelConstants';

export default function Login() {
  const router = useRouter();
  const { redirect, message } = router.query; // 🔥 Ajout de 'message'
  const [settings, setSettings] = useState({
    site_name: DEFAULT_HOTEL.name
  });
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // 🔥 Ajout

  useEffect(() => {
    loadSettings();
    setTimeout(() => setMounted(true), 50);

    // 🔥 Afficher message de succès si présent dans l'URL
    if (message === 'password-reset-success') {
      setSuccessMessage('✅ Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.');
    }
  }, [message]);

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
      setBackendError(false);
    } catch (error) {
      console.error('❌ Backend inaccessible:', error.message);
      setBackendError(true);
      // Ne pas bloquer l'affichage de la page
      // Utiliser les paramètres par défaut définis dans l'état initial
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.length > 0) setErrors([]);
    if (successMessage) setSuccessMessage(''); // 🔥 Réinitialiser le message de succès
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.email.trim()) {
      newErrors.push("L'email est requis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("L'email n'est pas valide");
    }

    if (!formData.password) {
      newErrors.push('Le mot de passe est requis');
    } else if (formData.password.length < 6) {
      newErrors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    return newErrors;
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      triggerShake();
      return;
    }

    setLoading(true);
    const redirectUrl = redirect || '/dashboard';

    try {
      // 1. Essayer Better Auth (email/password + 2FA si activé)
      const { data, error } = await authClient.signIn.email({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe,
        callbackURL: typeof window !== 'undefined' ? `${window.location.origin}${redirectUrl}` : redirectUrl,
      });

      if (!error && data) {
        const { ensureBackendToken } = await import('../utils/api');
        await ensureBackendToken();
        await router.replace(redirectUrl);
        return;
      }

      if (error?.status === 403 && error?.message?.toLowerCase().includes('verify')) {
        setErrors(['Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception.']);
        setLoading(false);
        triggerShake();
        return;
      }

      // 2. Fallback : backend JWT (utilisateurs existants)
      const loginResponse = await login({
        email: formData.email,
        password: formData.password
      });

      let dest = redirect;
      if (!dest) dest = loginResponse.user?.role === 'admin' ? '/admin' : '/dashboard';
      await router.replace(dest);

    } catch (error) {
      const errorMessage = error.message || 'Email ou mot de passe incorrect';
      if (errorMessage.includes('Serveur inaccessible') || errorMessage.includes('fetch')) {
        setErrors(['Le serveur est actuellement inaccessible. Veuillez réessayer plus tard.']);
      } else {
        setErrors([errorMessage]);
      }
      setLoading(false);
      triggerShake();
    }
  };

  return (
    <>
      <Head>
        <title>Connexion - {settings.site_name || DEFAULT_HOTEL.name}</title>
        <meta name="description" content={`Connectez-vous à votre espace client ${settings.site_name || DEFAULT_HOTEL.name}`} />
      </Head>

      <Header settings={settings} />

      <div className="auth-page">
        {/* Alerte backend si nécessaire */}
        {backendError && (
          <div className="backend-warning">
            ⚠️ Le serveur backend n'est pas accessible. Certaines fonctionnalités peuvent être limitées.
          </div>
        )}

        {/* Background effects */}
        <div className="bg-effects">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className={`auth-container ${mounted ? 'mounted' : ''}`}>
          <div className={`auth-card ${shake ? 'shake' : ''}`}>
            {/* Header */}
            <div className="auth-header">
              <div className="auth-icon-wrapper">
                <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <p className="auth-tagline">{settings.site_name || DEFAULT_HOTEL.name}</p>
              <h1 className="font-heading">Bon retour</h1>
              <p className="auth-subtitle">Connectez-vous pour accéder à votre espace client</p>
            </div>

            {/* 🔥 Success Message */}
            {successMessage && (
              <div className="success-box">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div>
                  <strong>Succès</strong>
                  <p>{successMessage}</p>
                </div>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="error-box">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div>
                  <strong>Erreur de connexion</strong>
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
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
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Mot de passe
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label="Afficher/Masquer le mot de passe"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-custom"></span>
                  <span>Se souvenir de moi</span>
                </label>

                <Link href="/forgot-password" className="forgot-link">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button type="submit" className="btn-submit" disabled={loading || backendError}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span>ou continuer avec</span>
            </div>

            {/* Social Login - Google OAuth via Better Auth */}
            <div className="social-login">
              <button
                className="social-btn google"
                type="button"
                disabled={loading || backendError}
                onClick={async () => {
                  try {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    await authClient.signIn.social({
                      provider: 'google',
                      callbackURL: origin ? `${origin}${redirect || '/dashboard'}` : '/dashboard',
                      errorCallbackURL: origin ? `${origin}/auth/error` : '/auth/error',
                    });
                  } catch (err) {
                    setErrors([err?.message || 'Erreur connexion Google']);
                    triggerShake();
                  }
                }}
              >
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

            </div>

            {/* Footer */}
            <div className="auth-footer">
              <p>Vous n'avez pas de compte ?</p>
              <Link href="/register" className="register-link">
                Créer un compte
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Side Info - Hôtel luxe */}
          <div className="auth-side">
            <div className="side-content">
              <div className="side-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h2 className="font-heading">Votre espace client</h2>
              <p className="side-intro">{DEFAULT_HOTEL.tagline}</p>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Gestion de vos réservations</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Concierge 24/7</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Facturation et paiements</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Check-in digital</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .backend-warning {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(201, 169, 110, 0.95);
          color: #1A1A1A;
          padding: 15px 25px;
          border-radius: 12px;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.5s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .auth-page {
          min-height: 100vh;
          background: #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          padding-top: 6rem;
          position: relative;
          overflow: hidden;
        }

        .bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.4;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(201,169,110,0.25) 0%, transparent 70%);
          top: -200px;
          left: -200px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(107,44,62,0.15) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }

        .auth-container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .auth-container.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .auth-card {
          background: rgba(250, 250, 248, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 169, 110, 0.2);
          border-radius: 24px;
          padding: 50px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          transition: transform 0.3s ease;
        }

        .auth-card.shake {
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .auth-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .auth-tagline {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #C9A96E;
          margin-bottom: 0.5rem;
        }
        .auth-icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(201, 169, 110, 0.3);
        }

        .auth-icon {
          width: 36px;
          height: 36px;
          stroke: #1A1A1A;
        }

        .auth-header h1 {
          font-size: 2.2em;
          color: #FAFAF8;
          margin-bottom: 8px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .auth-subtitle {
          color: #8B8680;
          font-size: 1em;
        }

        /* 🔥 SUCCESS BOX STYLES */
        .success-box {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background: rgba(52, 199, 89, 0.15);
          border: 2px solid rgba(52, 199, 89, 0.3);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          animation: slideDown 0.4s ease;
        }

        .success-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .success-icon svg {
          stroke: #34C759;
        }

        .success-box strong {
          display: block;
          color: white;
          font-size: 1.05em;
          margin-bottom: 5px;
        }

        .success-box p {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 500;
          margin: 0;
        }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          animation: slideDown 0.4s ease;
        }

        .error-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .error-icon svg {
          stroke: #ef4444;
        }

        .error-box strong {
          display: block;
          color: white;
          font-size: 1.05em;
          margin-bottom: 5px;
        }

        .error-box ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .error-box li {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 500;
          margin-bottom: 5px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 1.05em;
        }

        .form-group label svg {
          width: 20px;
          height: 20px;
        }

        .form-group input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 1.05em;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-family: inherit;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-group input:focus {
          outline: none;
          border-color: #C9A96E;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.2);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .password-input {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 5px;
          transition: all 0.3s ease;
        }

        .toggle-password:hover {
          color: white;
        }

        .toggle-password svg {
          width: 22px;
          height: 22px;
        }

        .toggle-password:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95em;
        }

        .remember-me input[type="checkbox"] {
          display: none;
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .remember-me input[type="checkbox"]:checked + .checkbox-custom {
          background: #C9A96E;
          border-color: #C9A96E;
        }

        .remember-me input[type="checkbox"]:checked + .checkbox-custom::after {
          content: '✓';
          color: #1A1A1A;
          font-weight: bold;
          font-size: 14px;
        }

        .forgot-link {
          color: #C9A96E;
          text-decoration: none;
          font-size: 0.95em;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .forgot-link:hover {
          color: #D4BC8E;
          text-decoration: underline;
        }

        .btn-submit {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #C9A96E 0%, #A68A5C 100%);
          color: #1A1A1A;
          border: none;
          border-radius: 12px;
          font-size: 1.05em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(201, 169, 110, 0.3);
          position: relative;
          overflow: hidden;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(201, 169, 110, 0.4);
          background: linear-gradient(135deg, #D4BC8E 0%, #C9A96E 100%);
        }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-submit svg {
      width: 22px;
      height: 22px;
      position: relative;
      z-index: 1;
    }

    .btn-submit span:not(.spinner) {
      position: relative;
      z-index: 1;
    }

    .spinner {
      width: 22px;
      height: 22px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 35px 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
    }

    .divider span {
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      padding: 0 20px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9em;
    }

    .social-login {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 35px;
    }

    .social-btn {
      padding: 14px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .social-btn:hover:not(:disabled) {
      background: rgba(201, 169, 110, 0.08);
      border-color: rgba(201, 169, 110, 0.3);
      transform: translateY(-2px);
    }

    .social-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .social-btn svg {
      width: 20px;
      height: 20px;
    }

    .auth-footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .auth-footer p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 15px;
    }

        .register-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #C9A96E;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.05em;
      transition: all 0.3s ease;
    }

    .register-link:hover {
      color: #D4BC8E;
      gap: 12px;
    }

    .register-link svg {
      width: 18px;
      height: 18px;
    }

    .auth-side {
      background: linear-gradient(160deg, #1A1A1A 0%, #2a2a2a 50%, rgba(107,44,62,0.15) 100%);
      border: 1px solid rgba(201, 169, 110, 0.2);
      border-radius: 24px;
      padding: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .auth-side::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 80%, rgba(201,169,110,0.08) 0%, transparent 50%);
    }

    .side-content {
      position: relative;
      z-index: 1;
      color: white;
    }

    .side-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 24px;
      background: rgba(201, 169, 110, 0.15);
      border: 1px solid rgba(201, 169, 110, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .side-icon svg {
      width: 32px;
      height: 32px;
      stroke: #C9A96E;
    }

    .side-intro {
      color: #8B8680;
      font-size: 0.95rem;
      text-align: center;
      margin-bottom: 1.5rem;
      font-style: italic;
    }

    .side-content h2 {
      font-size: 1.85em;
      margin-bottom: 0.5rem;
      font-weight: 500;
      text-align: center;
      color: #FAFAF8;
    }

    .side-content ul {
      margin-top: 1rem;
    }

    .side-content ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .side-content li {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      font-size: 1em;
      font-weight: 500;
      color: rgba(250, 250, 248, 0.9);
    }

    .side-content li svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      stroke: #C9A96E;
    }

    @media (max-width: 1024px) {
      .auth-container {
        grid-template-columns: 1fr;
      }

      .auth-side {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .auth-page {
        padding: 20px 15px;
      }

      .auth-card {
        padding: 35px 25px;
      }

      .auth-header h1 {
        font-size: 2em;
      }

      .social-login {
        grid-template-columns: 1fr;
      }

      .form-options {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .backend-warning {
        font-size: 0.9em;
        padding: 12px 20px;
        top: 10px;
      }
    }
  `}</style>
</>
);
}