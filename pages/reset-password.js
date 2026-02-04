// frontend/pages/reset-password.js - Réinitialisation mot de passe (Better Auth + style hôtel)
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authClient } from '../lib/auth-client';
import { fetchSettings } from '../utils/api';
import { DEFAULT_HOTEL } from '../lib/hotelConstants';

export default function ResetPassword() {
  const router = useRouter();
  const { token, error: urlError } = router.query;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ site_name: DEFAULT_HOTEL.name });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    if (urlError === 'INVALID_TOKEN') {
      setError('Ce lien a expiré ou est invalide. Demandez un nouveau lien de réinitialisation.');
    } else if (!token) {
      setError('Token manquant. Veuillez utiliser le lien reçu par email.');
    }
  }, [token, urlError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const { error: err } = await authClient.resetPassword({
        newPassword,
        token: typeof token === 'string' ? token : (token && token[0]) || '',
      });

      if (err) {
        setError(err.message || 'Erreur lors de la réinitialisation');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?message=password-reset-success');
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Réinitialiser mon mot de passe - {settings.site_name || DEFAULT_HOTEL.name}</title>
        <meta name="description" content="Créez un nouveau mot de passe" />
      </Head>

      <Header settings={settings} />

      <div className="reset-page">
        <div className="reset-bg">
          <div className="reset-orb orb-1"></div>
          <div className="reset-orb orb-2"></div>
          <div className="reset-orb orb-3"></div>
        </div>

        <div className={`reset-container ${mounted ? 'mounted' : ''}`}>
          <div className="reset-card">
            <div className="reset-header">
              <div className="reset-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="reset-tagline">{settings.site_name || DEFAULT_HOTEL.name}</p>
              <h1 className="font-heading">Nouveau mot de passe</h1>
              <p className="reset-sub">Choisissez un mot de passe sécurisé pour votre compte</p>
            </div>

            {success ? (
              <div className="reset-success">
                <div className="reset-success-icon">✓</div>
                <h2>Mot de passe réinitialisé</h2>
                <p>Votre mot de passe a été modifié avec succès.</p>
                <p className="reset-redirect">Redirection vers la connexion...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reset-form">
                {error && <div className="reset-error">⚠ {error}</div>}
                <div className="reset-group">
                  <label htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    required
                    disabled={loading || !token}
                  />
                </div>
                <div className="reset-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    required
                    disabled={loading || !token}
                  />
                </div>
                <button type="submit" className="reset-btn" disabled={loading || !token}>
                  {loading ? 'Réinitialisation...' : 'Réinitialiser mon mot de passe'}
                </button>
                <div className="reset-footer">
                  <Link href="/login" className="reset-link">← Retour à la connexion</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer settings={settings} />

      <style jsx>{`
        .reset-page {
          min-height: 100vh;
          background: #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 60px;
          position: relative;
        }
        .reset-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .reset-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }
        .reset-orb.orb-1 { width: 400px; height: 400px; background: rgba(201,169,110,0.15); top: 10%; left: 10%; }
        .reset-orb.orb-2 { width: 300px; height: 300px; background: rgba(107,44,62,0.1); bottom: 20%; right: 15%; }
        .reset-orb.orb-3 { width: 250px; height: 250px; background: rgba(201,169,110,0.08); bottom: 40%; left: 30%; }
        .reset-container {
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .reset-container.mounted { opacity: 1; transform: translateY(0); }
        .reset-card {
          background: rgba(250,250,248,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 24px;
          padding: 48px;
          max-width: 460px;
          width: 100%;
        }
        .reset-header { text-align: center; margin-bottom: 32px; }
        .reset-icon {
          width: 72px; height: 72px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .reset-icon svg { width: 32px; height: 32px; stroke: #1A1A1A; }
        .reset-tagline {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #C9A96E;
          margin-bottom: 8px;
        }
        .reset-header h1 { font-size: 1.8rem; color: #FAFAF8; margin-bottom: 8px; }
        .reset-sub { color: #8B8680; font-size: 0.95rem; }
        .reset-form { display: flex; flex-direction: column; gap: 20px; }
        .reset-group { display: flex; flex-direction: column; gap: 8px; }
        .reset-group label { color: #FAFAF8; font-size: 0.9rem; font-weight: 500; }
        .reset-group input {
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,169,110,0.3);
          border-radius: 12px;
          color: #FAFAF8;
          font-size: 1rem;
        }
        .reset-group input:focus {
          outline: none;
          border-color: #C9A96E;
          background: rgba(255,255,255,0.08);
        }
        .reset-group input::placeholder { color: #8B8680; }
        .reset-btn {
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
        .reset-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,169,110,0.35);
        }
        .reset-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .reset-error {
          padding: 12px 16px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.9rem;
        }
        .reset-footer { text-align: center; }
        .reset-link { color: #8B8680; font-size: 0.9rem; text-decoration: none; }
        .reset-link:hover { color: #C9A96E; }
        .reset-success { text-align: center; padding: 24px 0; }
        .reset-success-icon {
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
        .reset-success h2 { color: #FAFAF8; font-size: 1.4rem; margin-bottom: 12px; }
        .reset-success p { color: #8B8680; font-size: 0.95rem; margin-bottom: 8px; }
        .reset-redirect { font-size: 0.85rem !important; font-style: italic; margin-top: 16px !important; }
      `}</style>
    </>
  );
}
