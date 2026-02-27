/**
 * Header minimaliste fixe - Refined Versatility
 * Catégories au survol, recherche mise en avant, panier discret
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCartStore } from '@/lib/cart-store';
import { useAuth } from '@/hooks/useAuth';
import { ECAMSAP } from '@/lib/ecamsap';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Category {
  id: string;
  name: string;
  slug: string;
  products_count?: number;
}

export default function EcommerceHeader() {
  const router = useRouter();
  const { getItemCount } = useCartStore();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesHover, setCategoriesHover] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const itemCount = getItemCount();

  // Éviter hydration mismatch : panier et token lus côté client uniquement
  useEffect(() => {
    setMounted(true);
    setHasStoredToken(!!(localStorage.getItem('token') || localStorage.getItem('auth_token')));
  }, []);
  // Resync hasStoredToken quand le menu s'ouvre (au cas où on vient de se connecter)
  useEffect(() => {
    if (userMenuOpen && typeof window !== 'undefined') {
      setHasStoredToken(!!(localStorage.getItem('token') || localStorage.getItem('auth_token')));
    }
  }, [userMenuOpen]);

  // Fermer le menu utilisateur si clic dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/ecommerce/categories`).then((res) => {
      if (res.data?.success && res.data.categories) {
        setCategories(res.data.categories.slice(0, 8));
      }
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-offwhite/95 backdrop-blur border-b border-pearl' : 'bg-offwhite border-b border-pearl/50'
      }`}
    >
      <div className="max-w-grid mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="font-heading text-xl lg:text-2xl font-semibold text-charcoal tracking-tight">
            {ECAMSAP.name}
          </Link>

          {/* Nav centre - Catégories avec dropdown */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-charcoal hover:text-gold transition-colors duration-300"
            >
              Accueil
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setCategoriesHover(true)}
              onMouseLeave={() => setCategoriesHover(false)}
            >
              <button
                type="button"
                className="text-sm font-medium text-charcoal hover:text-gold transition-colors duration-300 flex items-center gap-1"
              >
                Boutique
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {categoriesHover && categories.length > 0 && (
                <div className="absolute top-full left-0 pt-2 -ml-2">
                  <div className="bg-offwhite border border-pearl shadow-refined-hover rounded-refined py-3 min-w-[220px]">
                    <Link
                      href="/products"
                      className="block px-5 py-2 text-sm text-charcoal hover:bg-pearl/50 transition-colors"
                    >
                      Tous les articles
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        className="block px-5 py-2 text-sm text-charcoal hover:bg-pearl/50 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Droite: Recherche + User + Panier */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Recherche */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  autoFocus
                  className="w-48 lg:w-64 px-3 py-2 text-sm border border-pearl rounded-refined bg-offwhite text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                />
                <button type="submit" className="ml-2 p-2 text-charcoal hover:text-gold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-charcoal hover:text-gold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-charcoal hover:text-gold transition-colors duration-300"
                aria-label="Rechercher"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Menu utilisateur : photo/avatar si connecté, icône sinon */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full text-charcoal hover:text-gold hover:ring-2 hover:ring-gold/50 transition-all duration-300"
                aria-label={isAuthenticated && user ? 'Mon espace' : 'Connexion'}
              >
                {isAuthenticated && user ? (
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gold/20 text-charcoal font-semibold text-sm">
                    {(user.firstname || user.first_name || user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-offwhite border border-pearl shadow-refined-hover rounded-refined py-2 z-50">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 border-b border-pearl">
                        <p className="text-sm font-medium text-charcoal">
                          {(user.firstname || user.first_name) && (user.lastname || user.last_name)
                            ? `${user.firstname || user.first_name} ${user.lastname || user.last_name}`
                            : user.name || user.email}
                        </p>
                        <p className="text-xs text-charcoal/60">{user.email}</p>
                      </div>
                      <Link
                        href={
                          user.role === 'admin'
                            ? '/admin/ecommerce/dashboard'
                            : user.role === 'dropshipper'
                            ? '/dropshipper/dashboard'
                            : '/dashboard'
                        }
                        className="block px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-pearl/50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mon espace
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin/users/roles"
                          className="block px-4 py-2 text-sm text-charcoal hover:bg-pearl/50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Gestion des rôles
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={hasStoredToken ? '/dashboard' : '/login'}
                        className="block px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-pearl/50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-pearl/50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        S&apos;inscrire
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Panier - discret mais accessible */}
            <Link
              href="/cart"
              className="relative p-2 text-charcoal hover:text-gold transition-colors duration-300"
              aria-label="Panier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gold text-offwhite text-caption font-medium rounded-capsule px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
