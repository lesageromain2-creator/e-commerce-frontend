/**
 * Sitemap XML dynamique
 * /sitemap.xml
 */

import { GetServerSideProps } from 'next';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function generateSiteMap(products: any[], categories: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Pages statiques -->
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Produits -->
  ${products
    .map((product) => {
      return `
  <url>
    <loc>${SITE_URL}/products/${product.slug}</loc>
    <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('')}
  
  <!-- Catégories -->
  ${categories
    .map((category) => {
      return `
  <url>
    <loc>${SITE_URL}/products?category=${category.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    // Récupérer tous les produits actifs
    const productsResponse = await axios.get(`${API_URL}/products?status=active&limit=1000`);
    const products = productsResponse.data.products || [];

    // Récupérer toutes les catégories actives
    const categoriesResponse = await axios.get(`${API_URL}/ecommerce/categories?active=true`);
    const categories = categoriesResponse.data.categories || [];

    // Générer le XML
    const sitemap = generateSiteMap(products, categories);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback minimal
    const sitemap = generateSiteMap([], []);
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  }
};

export default function Sitemap() {
  return null;
}
