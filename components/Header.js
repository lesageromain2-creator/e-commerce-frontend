// frontend/components/Header.js - Navigation luxe Hôtel La Grande Croix
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authClient } from '../lib/auth-client';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/sejour', label: 'Chambres' },
  { href: '/services', label: 'Services' },
  { href: '/restauration', label: 'Petit-déjeuner' },
  { href: '/offres-hotel', label: 'Offres' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/temoignages', label: 'Témoignages' },
  { href: '/contact', label: 'Contact' },
];

export default function Header({ settings = {} }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();
  const { data: betterAuthSession } = authClient.useSession();

  const siteName = settings.site_name || 'Hôtel';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('auth_token');
    const hasBetterAuth = !!betterAuthSession?.user;
    setIsLoggedIn(!!token || hasBetterAuth);

    if (token) {
      checkUserRole();
    } else if (hasBetterAuth) {
      setUserRole('client');
    }
  }, [betterAuthSession]);

  const checkUserRole = async () => {
    try {
      const { checkAuth } = await import('../utils/api');
      const authData = await checkAuth();
      if (authData.authenticated && authData.user) {
        setUserRole(authData.user.role);
      }
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    if (betterAuthSession) {
      await authClient.signOut();
    }
    setIsLoggedIn(false);
    setUserRole(null);
    setMenuOpen(false);
    router.push('/');
  };

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  const navClass = scrolled
    ? 'text-primary-dark hover:text-[#C9A96E]'
    : 'text-white hover:text-[#C9A96E]';

  const activeClass = 'text-[#C9A96E]';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 overflow-x-hidden transition-all duration-500 ${
        scrolled ? 'bg-[#FAFAF8]/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-2 pl-3 pr-6 md:pl-4 md:pr-8 lg:pl-6 lg:pr-10">
        <Link href="/" className="-ml-1 flex shrink-0 items-center gap-3 md:gap-4 lg:min-w-[140px]">
          <div
            className={`flex h-10 w-10 min-h-[2.5rem] min-w-[2.5rem] shrink-0 items-center justify-center rounded-full font-heading text-xl font-bold transition-colors duration-300 ${
              scrolled ? 'bg-[#1A1A1A] text-[#C9A96E]' : 'bg-[#C9A96E] text-[#1A1A1A]'
            }`}
          >
            {siteName.charAt(0)}
          </div>
          <div className="flex flex-col justify-center space-y-0.5">
            <span
              className={`block font-heading text-sm font-semibold tracking-tight md:text-base ${
                scrolled ? 'text-[#1A1A1A]' : 'text-white'
              }`}
            >
              {siteName}
            </span>
            <span
              className={`block text-[9px] font-accent font-medium uppercase tracking-[0.12em] ${
                scrolled ? 'text-[#8B8680]' : 'text-white/80'
              }`}
            >
              Hôtel de Luxe
            </span>
          </div>
        </Link>

        <nav className="hidden flex-1 justify-center items-center gap-4 xl:gap-6 font-accent text-xs lg:text-sm font-medium uppercase tracking-[0.08em] lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 transition-colors duration-300 ${
                isActive(item.href) ? activeClass : navClass
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex lg:min-w-[180px] lg:justify-end">
          <Link
            href="/reservation-chambre"
            className="rounded-full bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition-all duration-300 hover:bg-[#A68A5C] hover:-translate-y-0.5"
          >
            Réserver
          </Link>
            {isLoggedIn ? (
              <>
                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      scrolled
                        ? 'border-[#6B2C3E]/50 bg-[#6B2C3E]/10 text-[#6B2C3E] hover:bg-[#6B2C3E]/20'
                        : 'border-white/40 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                    scrolled
                      ? 'border-[#1A1A1A]/20 bg-[#1A1A1A]/5 text-[#1A1A1A] hover:bg-[#1A1A1A]/10'
                      : 'border-white/40 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Mon compte
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                    scrolled
                      ? 'bg-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  scrolled
                    ? 'border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                Connexion
              </Link>
            )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/reservation-chambre"
            className="rounded-full bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            Réserver
          </Link>
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              scrolled ? 'border-[#1A1A1A]/20 text-[#1A1A1A]' : 'border-white/30 text-white'
            }`}
          >
            <span className={`block h-0.5 w-4 rounded-full bg-current transition-transform ${menuOpen ? 'translate-y-0.5 rotate-45' : '-translate-y-1'}`} />
            <span className={`block h-0.5 w-4 rounded-full bg-current mt-1 transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block h-0.5 w-4 rounded-full bg-current mt-1 transition-transform ${menuOpen ? '-translate-y-1.5 -rotate-45' : 'translate-y-0'}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-40 w-[85%] max-w-sm overflow-y-auto bg-[#FAFAF8] px-6 py-8 shadow-2xl transition-transform lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-heading text-xl font-semibold text-[#1A1A1A]">{siteName}</span>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A1A1A]/5 text-[#1A1A1A]"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 font-accent text-sm uppercase tracking-[0.1em]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-lg px-4 py-3 transition-colors ${
                isActive(item.href) ? 'bg-[#C9A96E]/10 text-[#C9A96E]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 border-t border-[#1A1A1A]/10 pt-6">
          {isLoggedIn ? (
            <div className="space-y-2">
              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg border border-[#6B2C3E]/30 bg-[#6B2C3E]/10 px-4 py-2 text-center font-semibold text-[#6B2C3E]"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg bg-[#1A1A1A]/5 px-4 py-2 text-center font-semibold text-[#1A1A1A]"
              >
                Mon compte
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-lg bg-[#1A1A1A]/10 px-4 py-2 text-center font-semibold text-[#1A1A1A]"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block rounded-full bg-[#C9A96E] px-4 py-3 text-center font-semibold text-[#1A1A1A]"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
