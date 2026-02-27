/**
 * URL d'image produit pour affichage en boutique.
 * Les images uploadées sont servies par le backend (ex. http://localhost:5000/uploads/products/xxx.jpg).
 * Si l'URL stockée est relative (/uploads/...), on la préfixe par l'API pour que le navigateur charge depuis le bon serveur.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export function getProductImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '/placeholder.png';
  const trimmed = url.trim();
  if (!trimmed) return '/placeholder.png';
  // Déjà absolue (http/https) : utiliser telle quelle
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Relative (/uploads/...) : préfixer par l'URL du backend
  if (trimmed.startsWith('/')) return `${API_BASE}${trimmed}`;
  return trimmed;
}
