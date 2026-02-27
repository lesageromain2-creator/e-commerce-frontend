/**
 * Carte produit - Ratio 4:5, badge disponibilité, hover "Voir détails"
 * Refined Versatility
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProductImageUrl } from '@/utils/productImageUrl';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  featured_image?: string;
  images?: string[];
  is_on_sale?: boolean;
  stock_quantity: number;
  is_featured?: boolean;
  category_name?: string;
}

interface Props {
  product: ProductCardData;
  index?: number;
}

function toNum(value: unknown): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const rawUrl = product.featured_image || product.images?.[0];
  const imageUrl = getProductImageUrl(rawUrl) || '/placeholder.png';
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = product.stock_quantity === 0;
  const price = toNum(product.price);
  const compareAtPrice = toNum(product.compare_at_price);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="bg-pearl/30 rounded-refined overflow-hidden border border-pearl/50 hover:shadow-refined-hover hover:border-pearl transition-all duration-300">
          {/* Image ratio 4:5 */}
          <div className="relative aspect-product overflow-hidden bg-pearl/50">
            <img
              src={imgError ? '/placeholder.png' : imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
              onError={() => setImgError(true)}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                <span className="badge-capsule bg-charcoal text-offwhite">Rupture</span>
              </div>
            )}
            {!isOutOfStock && product.is_on_sale && (
              <span className="absolute top-3 left-3 badge-gold">Promo</span>
            )}
            {!isOutOfStock && product.is_featured && (
              <span className="absolute top-3 right-3 badge-charcoal">Best-seller</span>
            )}
            {/* Hover: Voir détails avec fond semi-transparent */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-offwhite/90 text-charcoal text-small font-medium px-4 py-2 rounded-refined">
                Voir détails
              </span>
            </div>
          </div>

          {/* Contenu: titre + prix + badge uniquement */}
          <div className="p-4">
            {product.category_name && (
              <span className="text-caption text-gold uppercase tracking-wider">{product.category_name}</span>
            )}
            <h3 className="font-heading text-h3 font-medium text-charcoal mt-1 mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-body font-semibold text-charcoal">{price.toFixed(2)} €</span>
                {compareAtPrice > 0 && compareAtPrice > price && (
                  <span className="text-small text-pearl line-through">{compareAtPrice.toFixed(2)} €</span>
                )}
              </div>
              {!isOutOfStock && product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                <span className="badge-sage">Quelques pièces</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
