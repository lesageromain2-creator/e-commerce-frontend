/**
 * Page Admin - Insertion données de test
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Database, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const seedData = async () => {
    setLoading(true);
    setResults([]);
    const token = localStorage.getItem('token');

    try {
      // 1. Créer les catégories
      setResults((prev) => [...prev, '📁 Création des catégories...']);
      
      const categories = [
        { name: 'Vêtements Homme', slug: 'vetements-homme', description: 'Collection vintage pour homme' },
        { name: 'Vêtements Femme', slug: 'vetements-femme', description: 'Collection vintage pour femme' },
        { name: 'Accessoires', slug: 'accessoires', description: 'Accessoires vintage' },
        { name: 'Chaussures', slug: 'chaussures', description: 'Chaussures vintage' },
      ];

      for (const cat of categories) {
        try {
          await axios.post(`${API_URL}/ecommerce/categories`, cat, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setResults((prev) => [...prev, `✅ Catégorie créée : ${cat.name}`]);
        } catch (error: any) {
          if (error.response?.data?.message?.includes('exist')) {
            setResults((prev) => [...prev, `⚠️ Catégorie existe déjà : ${cat.name}`]);
          } else {
            throw error;
          }
        }
      }

      // 2. Créer les marques
      setResults((prev) => [...prev, '\n🏷️ Création des marques...']);
      
      const brands = [
        { name: 'Levi\'s Vintage', slug: 'levis-vintage', description: 'Icône du denim vintage américain' },
        { name: 'Ralph Lauren', slug: 'ralph-lauren', description: 'Élégance américaine intemporelle' },
        { name: 'Carhartt', slug: 'carhartt', description: 'Workwear authentique' },
      ];

      // D'abord récupérer les catégories créées pour avoir les IDs
      const catsResponse = await axios.get(`${API_URL}/ecommerce/categories`);
      const catHommeId = catsResponse.data.categories.find((c: any) => c.slug === 'vetements-homme')?.id;
      const catFemmeId = catsResponse.data.categories.find((c: any) => c.slug === 'vetements-femme')?.id;

      for (const brand of brands) {
        try {
          // Note: il faudrait une route pour créer les marques
          setResults((prev) => [...prev, `⚠️ Route création marques à implémenter`]);
        } catch (error: any) {
          console.error('Erreur création marque:', error);
        }
      }

      // 3. Créer les produits
      setResults((prev) => [...prev, '\n📦 Création des produits...']);

      const products = [
        {
          sku: 'LEV-501-90S',
          name: 'Jean Levi\'s 501 Vintage Années 90',
          slug: 'jean-levis-501-vintage-90s',
          description: '<p>Authentique jean Levi\'s 501 des années 90 en excellent état. Coupe droite classique, denim brut délavé naturellement. Pièce unique vintage.</p><p><strong>Détails :</strong></p><ul><li>Taille : W32 L34</li><li>100% coton denim</li><li>Made in USA</li><li>État : Excellent (8/10)</li></ul>',
          shortDescription: 'Jean iconique Levi\'s 501 vintage années 90, coupe droite, denim authentique',
          categoryId: catHommeId,
          price: 89.90,
          compareAtPrice: 120.00,
          stockQuantity: 15,
          lowStockThreshold: 5,
          images: [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'
          ],
          featuredImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
          status: 'active',
          isFeatured: true,
          isOnSale: true,
          tags: ['denim', 'vintage', 'homme', '90s'],
        },
        {
          sku: 'RL-POLO-CREAM',
          name: 'Polo Ralph Lauren Vintage Crème',
          slug: 'polo-ralph-lauren-vintage-creme',
          description: '<p>Sublime polo Ralph Lauren vintage années 80-90 en coton piqué. Coloris crème intemporel avec logo brodé.</p><p><strong>Caractéristiques :</strong></p><ul><li>Taille : M</li><li>100% coton piqué</li><li>Logo polo brodé</li><li>État : Très bon (9/10)</li></ul>',
          shortDescription: 'Polo Ralph Lauren vintage crème, coton piqué, logo brodé',
          categoryId: catHommeId,
          price: 59.90,
          stockQuantity: 8,
          images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800'],
          featuredImage: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
          status: 'active',
          isFeatured: true,
          tags: ['polo', 'vintage', 'homme', 'ralph lauren'],
        },
        {
          sku: 'CAR-JACKET-BROWN',
          name: 'Veste Carhartt Workwear Marron',
          slug: 'veste-carhartt-workwear-marron',
          description: '<p>Veste Carhartt vintage authentique des années 90. Toile coton robuste marron, doublure sherpa amovible.</p><p><strong>Spécifications :</strong></p><ul><li>Taille : L</li><li>Toile coton duck</li><li>Doublure sherpa</li><li>État : Excellent (8/10)</li></ul>',
          shortDescription: 'Veste workwear Carhartt vintage marron, doublure sherpa',
          categoryId: catHommeId,
          price: 149.90,
          compareAtPrice: 189.90,
          stockQuantity: 5,
          images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
          featuredImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
          status: 'active',
          isFeatured: true,
          isOnSale: true,
          tags: ['veste', 'vintage', 'homme', 'carhartt'],
        },
        {
          sku: 'DRESS-FLORAL-80S',
          name: 'Robe Fleurie Vintage Années 80',
          slug: 'robe-fleurie-vintage-80s',
          description: '<p>Magnifique robe vintage années 80 à motifs floraux. Coupe fluide, manches bouffantes, ceinture à nouer.</p><p><strong>Détails :</strong></p><ul><li>Taille : M (38-40)</li><li>100% viscose</li><li>Longueur midi</li><li>État : Excellent (9/10)</li></ul>',
          shortDescription: 'Robe vintage années 80 à fleurs, coupe fluide, manches bouffantes',
          categoryId: catFemmeId,
          price: 79.90,
          stockQuantity: 12,
          images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
          featuredImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
          status: 'active',
          isFeatured: true,
          tags: ['robe', 'vintage', 'femme', '80s'],
        },
      ];

      for (const product of products) {
        try {
          const response = await axios.post(`${API_URL}/products`, product, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setResults((prev) => [...prev, `✅ Produit créé : ${product.name}`]);
        } catch (error: any) {
          if (error.response?.data?.message?.includes('exist') || error.response?.data?.message?.includes('unique')) {
            setResults((prev) => [...prev, `⚠️ Produit existe déjà : ${product.name}`]);
          } else {
            setResults((prev) => [...prev, `❌ Erreur : ${product.name} - ${error.response?.data?.message || error.message}`]);
          }
        }
      }

      setResults((prev) => [...prev, '\n✅ Données de test insérées avec succès !']);
      toast.success('Données de test créées !');
    } catch (error: any) {
      console.error('Erreur seed:', error);
      setResults((prev) => [...prev, `❌ Erreur globale : ${error.message}`]);
      toast.error('Erreur lors de la création des données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Données de test | Admin</title>
      </Head>

      <div className="min-h-screen bg-offwhite">
        <header className="bg-white border-b border-pearl">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link
              href="/admin/ecommerce/dashboard"
              className="inline-flex items-center gap-2 text-charcoal/70 hover:text-charcoal text-sm font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </Link>
            <h1 className="font-heading text-2xl text-charcoal flex items-center gap-2">
              <Database className="w-6 h-6" />
              Insérer données de test
            </h1>
            <p className="text-small text-charcoal/60 mt-1">
              Créer des catégories, marques et produits de démonstration
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-refined p-8 border border-pearl">
            <div className="mb-6">
              <h2 className="font-heading text-xl text-charcoal mb-2">Que fait ce script ?</h2>
              <ul className="space-y-2 text-small text-charcoal/70">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>4 catégories (Homme, Femme, Accessoires, Chaussures)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>3 marques vintage (Levi's, Ralph Lauren, Carhartt)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>4 produits de démonstration avec images</span>
                </li>
              </ul>
            </div>

            <button
              onClick={seedData}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Insertion en cours...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Insérer les données de test
                </>
              )}
            </button>

            {results.length > 0 && (
              <div className="mt-6 bg-charcoal/5 rounded-refined p-4 max-h-96 overflow-y-auto">
                <p className="font-mono text-xs font-medium text-charcoal/70 mb-2">Résultats :</p>
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <p key={index} className="font-mono text-xs text-charcoal/80 whitespace-pre-wrap">
                      {result}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-refined">
              <p className="text-small text-yellow-800">
                <strong>Note :</strong> Les produits déjà existants ne seront pas créés en double.
                Un message d'avertissement s'affichera pour chaque élément existant.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
