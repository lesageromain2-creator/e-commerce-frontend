/**
 * Page Admin - Modifier un produit
 * /admin/ecommerce/products/[id]/edit
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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

const initialFormData = {
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
};

export default function EditProductPage() {
  const router = useRouter();
  const rawId = router.query.id;
  const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProduct = async () => {
    if (!id || typeof id !== 'string') return;
    setLoadingProduct(true);
    try {
      const response = await axios.get(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.data.success && response.data.product) {
        const p = response.data.product;
        setProductId(id);
        setFormData({
          sku: p.sku || '',
          name: p.name || '',
          slug: p.slug || '',
          description: p.description || '',
          shortDescription: p.short_description || '',
          categoryId: p.category_id || '',
          brandId: p.brand_id || '',
          price: p.price != null ? String(p.price) : '',
          compareAtPrice: p.compare_at_price != null ? String(p.compare_at_price) : '',
          stockQuantity: p.stock_quantity != null ? String(p.stock_quantity) : '',
          lowStockThreshold: p.low_stock_threshold != null ? String(p.low_stock_threshold) : '10',
          status: p.status || 'draft',
          isFeatured: !!p.is_featured,
          isOnSale: !!p.is_on_sale,
          trackInventory: p.track_inventory !== false,
          allowBackorder: !!p.allow_backorder,
          metaTitle: p.meta_title || '',
          metaDescription: p.meta_description || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
          featuredImage: p.featured_image || (Array.isArray(p.images) && p.images[0]) || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(error.response?.data?.message || 'Produit introuvable');
      router.push('/admin/ecommerce/products');
    } finally {
      setLoadingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/ecommerce/categories`);
      if (response.data.success) setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    setBrands([
      { id: '1', name: 'TechPro' },
      { id: '2', name: 'StyleLife' },
    ]);
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
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      const response = await axios.post(`${API_URL}/upload/product-image`, formDataUpload, {
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
    const idToUse = productId || id;
    if (!idToUse) {
      toast.error('ID produit manquant');
      return;
    }
    const priceNum = parseFloat(formData.price);
    const compareNum = formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : NaN;
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error('Prix invalide');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || undefined,
        shortDescription: formData.shortDescription?.trim() || undefined,
        categoryId: formData.categoryId?.trim() || undefined,
        brandId: formData.brandId?.trim() || undefined,
        tags: formData.tags?.trim()
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        price: priceNum,
        compareAtPrice: Number.isNaN(compareNum) || compareNum < 0 ? undefined : compareNum,
        stockQuantity: Math.max(0, parseInt(formData.stockQuantity, 10) || 0),
        lowStockThreshold: Math.max(0, parseInt(formData.lowStockThreshold, 10) || 10),
        status: formData.status,
        isFeatured: formData.isFeatured,
        isOnSale: formData.isOnSale,
        trackInventory: formData.trackInventory,
        allowBackorder: formData.allowBackorder,
        metaTitle: formData.metaTitle?.trim() || undefined,
        metaDescription: formData.metaDescription?.trim() || undefined,
        featuredImage: formData.featuredImage?.trim() || undefined,
        images: formData.featuredImage?.trim() ? [formData.featuredImage.trim()] : undefined,
      };
      if (payload.categoryId === '') delete payload.categoryId;
      if (payload.brandId === '') delete payload.brandId;

      const response = await axios.patch(`${API_URL}/products/${idToUse}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        toast.success('Produit mis à jour');
        router.push('/admin/ecommerce/products');
      } else {
        toast.error(response.data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      const msg = error.response?.data?.message || 'Erreur lors de la mise à jour';
      const errors = error.response?.data?.errors;
      const detail = errors?.length
        ? errors.map((e: { path?: string[]; message?: string }) => `${e.path?.join('.')}: ${e.message}`).join(', ')
        : msg;
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const idToUse = productId || id;
    if (!idToUse) return;
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    try {
      await axios.delete(`${API_URL}/products/${idToUse}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Produit supprimé');
      router.push('/admin/ecommerce/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Modifier le produit | Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href="/admin/ecommerce/products"
              className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux produits
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Modifier le produit</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Informations générales</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom du produit *</label>
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
                      <label className="block text-sm font-medium mb-1">Slug (URL) *</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image du produit</label>
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
                      <label className="block text-sm font-medium mb-1">Description courte</label>
                      <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description complète</label>
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

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Prix et stock</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU *</label>
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
                      <label className="block text-sm font-medium mb-1">Prix (€) *</label>
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
                      <label className="block text-sm font-medium mb-1">Prix comparé (€)</label>
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
                      <label className="block text-sm font-medium mb-1">Quantité en stock *</label>
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
                      <label className="block text-sm font-medium mb-1">Seuil stock faible</label>
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
                        <span className="ml-2 text-sm">Suivre l&apos;inventaire</span>
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

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">SEO</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Meta titre</label>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        maxLength={60}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Meta description</label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        maxLength={160}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
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
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                  <Link href="/admin/ecommerce/products">
                    <button
                      type="button"
                      className="w-full border-2 border-gray-300 py-3 rounded-lg font-bold hover:border-gray-400 transition-all"
                    >
                      Annuler
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-all"
                  >
                    Supprimer le produit
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
