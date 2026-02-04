// Page de confirmation après vérification email (callback Better Auth)
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchSettings } from '../../utils/api';
import { DEFAULT_HOTEL } from '../../lib/hotelConstants';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { success, error } = router.query;
  const [settings, setSettings] = useState({ site_name: DEFAULT_HOTEL.name });

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  const verified = success !== undefined && success !== 'false';
  const hasError = error !== undefined;

  return (
    <>
      <Head>
        <title>Vérification email - {settings.site_name || DEFAULT_HOTEL.name}</title>
      </Head>
      <Header settings={settings} />
      <div className="verify-page">
        <div className="verify-card">
          {verified && !hasError ? (
            <>
              <div className="verify-icon success">✓</div>
              <h1>Email vérifié</h1>
              <p>Votre adresse email a été confirmée. Vous pouvez maintenant vous connecter.</p>
              <Link href="/login" className="verify-btn">Se connecter</Link>
            </>
          ) : (
            <>
              <div className="verify-icon error">!</div>
              <h1>Lien invalide ou expiré</h1>
              <p>Ce lien de vérification a expiré ou n&apos;est pas valide. Vous pouvez demander un nouvel email depuis votre espace ou vous connecter.</p>
              <Link href="/login" className="verify-btn">Retour à la connexion</Link>
            </>
          )}
        </div>
      </div>
      <Footer settings={settings} />
      <style jsx>{`
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
          background: #1A1A1A;
        }
        .verify-card {
          background: rgba(250,250,248,0.03);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 24px;
          padding: 48px;
          max-width: 440px;
          text-align: center;
        }
        .verify-icon {
          width: 72px; height: 72px;
          margin: 0 auto 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
        }
        .verify-icon.success { background: rgba(52,199,89,0.2); color: #22c55e; }
        .verify-icon.error { background: rgba(239,68,68,0.2); color: #f87171; }
        .verify-card h1 { color: #FAFAF8; font-size: 1.5rem; margin-bottom: 12px; }
        .verify-card p { color: #8B8680; margin-bottom: 24px; font-size: 0.95rem; }
        .verify-btn {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(135deg, #C9A96E, #A68A5C);
          color: #1A1A1A;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
        }
        .verify-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,169,110,0.35); }
      `}</style>
    </>
  );
}
