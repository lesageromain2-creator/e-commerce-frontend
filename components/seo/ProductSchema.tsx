/**
 * Composant Schema.org pour les produits
 * Structured Data pour le SEO
 */

interface Product {
  name: string;
  description: string;
  image: string;
  images?: string[];
  sku: string;
  price: number;
  currency: string;
  slug: string;
  brand_name?: string;
  stock_quantity: number;
  average_rating?: number;
  reviews_count?: number;
}

interface ProductSchemaProps {
  product: Product;
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images || [product.image],
    sku: product.sku,
    ...(product.brand_name && {
      brand: {
        '@type': 'Brand',
        name: product.brand_name,
      },
    }),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: product.currency || 'EUR',
      price: product.price,
      availability:
        product.stock_quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'VotreShop',
      },
    },
    ...(product.reviews_count && product.reviews_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.average_rating,
        reviewCount: product.reviews_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Schema pour l'organisation (page d'accueil)
 */
export function OrganizationSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VotreShop',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Réseaux sociaux à ajouter
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@votreshop.com',
      availableLanguage: ['French'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Schema BreadcrumbList
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Schema WebSite (page d'accueil)
 */
export function WebSiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VotreShop',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
