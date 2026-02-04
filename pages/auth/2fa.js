// Vérification 2FA (TOTP) - style hôtel luxe
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { authClient } from '../../lib/auth-client';
import { fetchSettings } from '../../utils/api';
import { DEFAULT_HOTEL } from '../../lib/hotelConstants';

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ site_name: DEFAULT_HOTEL.name });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Veuillez entrer le code à 6 chiffres.');
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await authClient.twoFactor.verifyTotp({
        code: code.trim(),
        trustDevice: true,
      });
      if (err) {
        setError(err.message || 'Code invalide. Réessayez.');
        setLoading(false);
        return;
      }
      const { ensureBackendToken } = await import('../../utils/api');
      await ensureBackendToken();
      const redirect = router.query.redirect || '/dashboard';
      await router.replace(redirect);
    } catch (err) {
      setError(err?.message || 'Erreur de vérification.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vérification en deux étapes - {settings.site_name || DEFAULT_HOTEL.name}</title>
      </Head>
      <Header settings={settings} />
      <div className="auth-2fa-page">
        <div className="auth-2fa-bg">
          <div className="auth-2fa-orb orb-1"></div>
          <div className="auth-2fa-orb orb-2"></div>
        </div>
        <div className={`auth-2fa-card ${mounted ? 'mounted' : ''}`}>
          <div className="auth-2fa-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="auth-2fa-tagline">{settings.site_name || DEFAULT_HOTEL.name}</p>
          <h1>Vérification en deux étapes</h1>
          <p className="auth-2fa-desc">Entrez le code à 6 chiffres affiché dans votre application d&apos;authentification (Google Authenticator, Authy, etc.).</p>
          <form onSubmit={handleVerify}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="auth-2fa-input"
              disabled={loading}
              autoFocus
            />
            {error && <p className="auth-2fa-error">{error}</p>}
            <button type="submit" className="auth-2fa-submit" disabled={loading}>
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>
          <Link href="/login" className="auth-2fa-back">← Retour à la connexion</Link>
        </div>
      </div>
      <Footer settings={settings} />
      <style jsx>{`
        .auth-2fa-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px 60px;
          background: #1A1A1A;
          position: relative;
        }
        .auth-2fa-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .auth-2fa-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
        }
        .auth-2fa-orb.orb-1 { width: 350px; height: 350px; background: rgba(201,169,110,0.12); top: 15%; left: 20%; }
        .auth-2fa-orb.orb-2 { width: 280px; height: 280px; background: rgba(107,44,62,0.1); bottom: 20%; right: 25%; }
        .auth-2fa-card {
          position: relative;
          z-index: 1;
          background: rgba(250,250,248,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 24px;
          padding: 48px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease;
        }
        .auth-2fa-card.mounted { opacity: 1; transform: translateY(0); }
        .auth-2fa-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-2fa-icon svg { width: 32px; height: 32px; stroke: #1A1A1A; }
        .auth-2fa-tagline {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #C9A96E;
          margin-bottom: 8px;
        }
        .auth-2fa-card h1 {
          color: #FAFAF8;
          font-size: 1.5rem;
          margin-bottom: 12px;
        }
        .auth-2fa-desc {
          color: #8B8680;
          margin-bottom: 24px;
          font-size: 0.95rem;
        }
        .auth-2fa-input {
          width: 100%;
          padding: 16px 20px;
          font-size: 1.5rem;
          letter-spacing: 0.5em;
          text-align: center;
          border: 2px solid rgba(201,169,110,0.3);
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          color: #FAFAF8;
          margin-bottom: 16px;
        }
        .auth-2fa-input:focus {
          outline: none;
          border-color: #C9A96E;
        }
        .auth-2fa-error {
          color: #f87171;
          font-size: 0.9rem;
          margin-bottom: 12px;
        }
        .auth-2fa-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          color: #1A1A1A;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.3s;
        }
        .auth-2fa-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,169,110,0.35);
        }
        .auth-2fa-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-2fa-back {
          color: #8B8680;
          font-size: 0.9rem;
          text-decoration: none;
        }
        .auth-2fa-back:hover {
          color: #C9A96E;
        }
      `}</style>
    </>
  );
}
