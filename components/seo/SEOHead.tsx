/**
 * Composant SEO Head réutilisable
 * Gestion des métadonnées, Open Graph, Twitter Cards
 */

import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  nofollow = false,
}: SEOHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const siteName = 'VotreShop';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonicalUrl = canonical || siteUrl;
  const defaultOgImage = `${siteUrl}/og-image.jpg`;

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
      <meta name="twitter:site" content="@votreshop" />
      <meta name="twitter:creator" content="@votreshop" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="French" />
      <meta name="author" content={siteName} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
}

/**
 * Hook personnalisé pour gérer les métadonnées facilement
 */
export function useSEO(props: SEOHeadProps) {
  return <SEOHead {...props} />;
}
