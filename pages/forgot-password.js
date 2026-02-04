// frontend/pages/forgot-password.js - Mot de passe oublié (Better Auth + style hôtel)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authClient } from '../lib/auth-client';
import { fetchSettings } from '../utils/api';
import { DEFAULT_HOTEL } from '../lib/hotelConstants';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ site_name: DEFAULT_HOTEL.name });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      setLoading(false);
      return;
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error: err } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${origin}/reset-password`,
      });

      if (err) {
        setError(err.message || "Erreur lors de l'envoi");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mot de passe oublié - {settings.site_name || DEFAULT_HOTEL.name}</title>
        <meta name="description" content="Réinitialisez votre mot de passe" />
      </Head>

      <Header settings={settings} />

      <div className="forgot-page">
        <div className="forgot-bg">
          <div className="forgot-orb orb-1"></div>
          <div className="forgot-orb orb-2"></div>
          <div className="forgot-orb orb-3"></div>
        </div>

        <div className={`forgot-container ${mounted ? 'mounted' : ''}`}>
          <div className="forgot-card">
            <div className="forgot-header">
              <div className="forgot-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="forgot-tagline">{settings.site_name || DEFAULT_HOTEL.name}</p>
              <h1 className="font-heading">Mot de passe oublié ?</h1>
              <p className="forgot-sub">Entrez votre email pour recevoir un lien de réinitialisation</p>
            </div>

            {success ? (
              <div className="forgot-success">
                <div className="forgot-success-icon">✓</div>
                <h2>Email envoyé</h2>
                <p>Si un compte existe avec cet email, vous recevrez un lien de réinitialisation sous peu.</p>
                <p className="forgot-info">Vérifiez vos spams si nécessaire.</p>
                <Link href="/login" className="forgot-btn-back">← Retour à la connexion</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="forgot-form">
                {error && <div className="forgot-error">⚠ {error}</div>}
                <div className="forgot-group">
                  <label htmlFor="email">Adresse email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="forgot-btn" disabled={loading}>
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
                <div className="forgot-footer">
                  <Link href="/login" className="forgot-link">← Retour à la connexion</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .forgot-page {
          min-height: 100vh;
          background: #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 60px;
          position: relative;
        }
        .forgot-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .forgot-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }
        .forgot-orb.orb-1 { width: 400px; height: 400px; background: rgba(201,169,110,0.15); top: 10%; left: 10%; }
        .forgot-orb.orb-2 { width: 300px; height: 300px; background: rgba(107,44,62,0.1); bottom: 20%; right: 15%; }
        .forgot-orb.orb-3 { width: 250px; height: 250px; background: rgba(201,169,110,0.08); bottom: 40%; left: 30%; }
        .forgot-container {
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .forgot-container.mounted { opacity: 1; transform: translateY(0); }
        .forgot-card {
          background: rgba(250,250,248,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 24px;
          padding: 48px;
          max-width: 460px;
          width: 100%;
        }
        .forgot-header { text-align: center; margin-bottom: 32px; }
        .forgot-icon {
          width: 72px; height: 72px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .forgot-icon svg { width: 32px; height: 32px; stroke: #1A1A1A; }
        .forgot-tagline {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #C9A96E;
          margin-bottom: 8px;
        }
        .forgot-header h1 { font-size: 1.8rem; color: #FAFAF8; margin-bottom: 8px; }
        .forgot-sub { color: #8B8680; font-size: 0.95rem; }
        .forgot-form { display: flex; flex-direction: column; gap: 20px; }
        .forgot-group { display: flex; flex-direction: column; gap: 8px; }
        .forgot-group label { color: #FAFAF8; font-size: 0.9rem; font-weight: 500; }
        .forgot-group input {
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,169,110,0.3);
          border-radius: 12px;
          color: #FAFAF8;
          font-size: 1rem;
        }
        .forgot-group input:focus {
          outline: none;
          border-color: #C9A96E;
          background: rgba(255,255,255,0.08);
        }
        .forgot-group input::placeholder { color: #8B8680; }
        .forgot-btn {
          padding: 16px 24px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          color: #1A1A1A;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .forgot-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,169,110,0.35);
        }
        .forgot-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .forgot-error {
          padding: 12px 16px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.9rem;
        }
        .forgot-footer { text-align: center; }
        .forgot-link { color: #8B8680; font-size: 0.9rem; text-decoration: none; }
        .forgot-link:hover { color: #C9A96E; }
        .forgot-success { text-align: center; padding: 24px 0; }
        .forgot-success-icon {
          width: 64px; height: 64px;
          margin: 0 auto 20px;
          background: rgba(52,199,89,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #22c55e;
        }
        .forgot-success h2 { color: #FAFAF8; font-size: 1.4rem; margin-bottom: 12px; }
        .forgot-success p { color: #8B8680; font-size: 0.95rem; margin-bottom: 8px; }
        .forgot-info { font-size: 0.85rem !important; margin-top: 16px !important; }
        .forgot-btn-back {
          display: inline-block;
          margin-top: 24px;
          padding: 12px 24px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(201,169,110,0.3);
          border-radius: 10px;
          color: #FAFAF8;
          text-decoration: none;
          font-weight: 500;
        }
        .forgot-btn-back:hover { background: rgba(201,169,110,0.2); }
      `}</style>
    </>
  );
}
