/**
 * Page Admin - Créer un produit
 * /admin/ecommerce/products/create
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    brandId: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '',
    lowStockThreshold: '10',
    status: 'draft',
    isFeatured: false,
    isOnSale: false,
    trackInventory: true,
    allowBackorder: false,
    metaTitle: '',
    metaDescription: '',
    tags: '',
    featuredImage: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    // Auto-génération du slug
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/ecommerce/categories`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      // TODO: Créer route API pour les marques
      // const response = await axios.get(`${API_URL}/ecommerce/brands`);
      // setBrands(response.data.brands);
      
      // Mock data pour l'instant
      setBrands([
        { id: '1', name: 'TechPro' },
        { id: '2', name: 'StyleLife' },
      ]);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPEG, PNG, WebP ou GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo).');
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(`${API_URL}/upload/product-image`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data?.success && response.data?.url) {
        setFormData((prev) => ({ ...prev, featuredImage: response.data.url }));
        toast.success('Image envoyée.');
      } else {
        toast.error(response.data?.message || 'Échec de l\'upload.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'upload.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        shortDescription: formData.shortDescription || undefined,
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isOnSale: formData.isOnSale,
        trackInventory: formData.trackInventory,
        allowBackorder: formData.allowBackorder,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        images: formData.featuredImage?.trim() ? [formData.featuredImage.trim()] : [],
        featuredImage: formData.featuredImage?.trim() || undefined,
      };

      const response = await axios.post(`${API_URL}/products`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        toast.success('Produit créé avec succès !');
        router.push('/admin/ecommerce/products');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Créer un produit | Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Créer un produit</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulaire principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informations générales */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Informations générales</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nom du produit *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Slug (URL) *
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL: /products/{formData.slug || 'slug-du-produit'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Image du produit
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="sr-only"
                            />
                            {uploadingImage ? 'Envoi…' : 'Choisir un fichier'}
                          </label>
                          <span className="text-xs text-gray-500">ou coller une URL ci-dessous</span>
                        </div>
                        <input
                          type="url"
                          name="featuredImage"
                          value={formData.featuredImage}
                          onChange={handleChange}
                          placeholder="https://exemple.com/image.jpg"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {formData.featuredImage && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Aperçu :</p>
                          <img
                            src={formData.featuredImage}
                            alt="Aperçu"
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description courte
                      </label>
                      <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.shortDescription.length}/500 caractères
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description complète
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Prix et stock */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Prix et stock</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Prix (€) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Prix comparé (€)
                      </label>
                      <input
                        type="number"
                        name="compareAtPrice"
                        value={formData.compareAtPrice}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quantité en stock *
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        min="0"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Seuil stock faible
                      </label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="trackInventory"
                          checked={formData.trackInventory}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">Suivre l'inventaire</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="allowBackorder"
                          checked={formData.allowBackorder}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">Autoriser les précommandes</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">SEO</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Meta titre (60 caractères max)
                      </label>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        maxLength={60}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaTitle.length}/60 caractères
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Meta description (160 caractères max)
                      </label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        maxLength={160}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaDescription.length}/160 caractères
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tags (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="électronique, smartphone, android"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Statut */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold mb-4">Publication</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Statut</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="active">Actif</option>
                        <option value="archived">Archivé</option>
                      </select>
                    </div>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Produit vedette</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isOnSale"
                        checked={formData.isOnSale}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">En promotion</span>
                    </label>
                  </div>
                </div>

                {/* Catégorie & Marque */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold mb-4">Organisation</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Catégorie</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Aucune catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Marque</label>
                      <select
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Aucune marque</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
                  >
                    {loading ? 'Création...' : 'Créer le produit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full border-2 border-gray-300 py-3 rounded-lg font-bold hover:border-gray-400 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
