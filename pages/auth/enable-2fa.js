// Activer la double authentification (TOTP) - style hôtel
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { authClient } from '../../lib/auth-client';
import { fetchSettings } from '../../utils/api';
import { DEFAULT_HOTEL } from '../../lib/hotelConstants';

export default function Enable2FAPage() {
  const router = useRouter();
  const [uri, setUri] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('fetch'); // fetch | verify | success
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ site_name: DEFAULT_HOTEL.name });

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 'fetch') return;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: err } = await authClient.twoFactor.getTotpUri();
        if (err) {
          setError(err.message || 'Erreur lors de la génération');
          setLoading(false);
          return;
        }
        if (data?.uri) {
          setUri(data.uri);
          setSecret(data.secret || '');
          setStep('verify');
        }
      } catch (e) {
        setError(e?.message || 'Erreur');
      }
      setLoading(false);
    };
    run();
  }, [step]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || code.length !== 6) {
      setError('Entrez le code à 6 chiffres de votre application.');
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await authClient.twoFactor.verifyTotp({
        code: code.trim(),
        trustDevice: true,
      });
      if (err) {
        setError(err.message || 'Code invalide.');
        setLoading(false);
        return;
      }
      setStep('success');
    } catch (e) {
      setError(e?.message || 'Erreur');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Activer la 2FA - {settings.site_name || DEFAULT_HOTEL.name}</title>
      </Head>
      <Header settings={settings} />
      <div className="enable2fa-page">
        <div className="enable2fa-card">
          <h1 className="font-heading text-xl text-[#FAFAF8] mb-2">Activer la double authentification</h1>
          <p className="text-[#8B8680] text-sm mb-6">Protégez votre compte avec une application d&apos;authentification (Google Authenticator, Authy, etc.)</p>

          {step === 'fetch' && (
            <div className="enable2fa-loading">
              {loading ? 'Génération du QR code...' : 'Chargement...'}
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify}>
              {error && <div className="enable2fa-error">{error}</div>}
              <div className="enable2fa-qr">
                {uri && (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`}
                    alt="QR Code 2FA"
                    width={200}
                    height={200}
                  />
                )}
              </div>
              {secret && (
                <p className="text-[#8B8680] text-xs mb-4">Ou entrez manuellement : <code className="bg-white/5 px-2 py-1 rounded">{secret}</code></p>
              )}
              <p className="text-[#8B8680] text-sm mb-3">Scannez le QR code avec votre application, puis entrez le code à 6 chiffres :</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="enable2fa-input"
                disabled={loading}
              />
              <button type="submit" className="enable2fa-btn" disabled={loading || code.length !== 6}>
                {loading ? 'Vérification...' : 'Activer la 2FA'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="enable2fa-success">
              <div className="enable2fa-success-icon">✓</div>
              <h2>2FA activée</h2>
              <p>Votre compte est maintenant protégé. Un code vous sera demandé à chaque connexion.</p>
              <Link href="/dashboard" className="enable2fa-btn">Retour au tableau de bord</Link>
            </div>
          )}

          <Link href="/dashboard" className="enable2fa-back">← Retour</Link>
        </div>
      </div>
      <Footer settings={settings} />
      <style jsx>{`
        .enable2fa-page {
          min-height: 100vh;
          padding: 100px 20px 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1A1A1A;
        }
        .enable2fa-card {
          background: rgba(250,250,248,0.03);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 24px;
          padding: 40px;
          max-width: 420px;
          width: 100%;
        }
        .enable2fa-loading { text-align: center; color: #8B8680; padding: 40px 0; }
        .enable2fa-qr {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }
        .enable2fa-qr img { border-radius: 8px; }
        .enable2fa-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 1.25rem;
          letter-spacing: 0.5em;
          text-align: center;
          border: 2px solid rgba(201,169,110,0.3);
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          color: #FAFAF8;
          margin-bottom: 16px;
        }
        .enable2fa-input:focus {
          outline: none;
          border-color: #C9A96E;
        }
        .enable2fa-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          color: #1A1A1A;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s;
        }
        .enable2fa-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201,169,110,0.35);
        }
        .enable2fa-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .enable2fa-error {
          padding: 12px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        .enable2fa-back {
          display: block;
          margin-top: 24px;
          text-align: center;
          color: #8B8680;
          font-size: 0.9rem;
          text-decoration: none;
        }
        .enable2fa-back:hover { color: #C9A96E; }
        .enable2fa-success { text-align: center; }
        .enable2fa-success-icon {
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
        .enable2fa-success h2 { color: #FAFAF8; margin-bottom: 8px; }
        .enable2fa-success p { color: #8B8680; font-size: 0.95rem; margin-bottom: 20px; }
      `}</style>
    </>
  );
}
