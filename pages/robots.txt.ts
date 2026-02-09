/**
 * Robots.txt dynamique
 * /robots.txt
 */

import { GetServerSideProps } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function generateRobotsTxt() {
  return `# Robots.txt - VotreShop E-commerce
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /checkout
Disallow: /account
Disallow: /cart
Disallow: /_next/
Disallow: /static/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay pour limiter la charge serveur
Crawl-delay: 1

# Googlebot spécifique
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /checkout
Disallow: /account

# Bingbot
User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /checkout
Disallow: /account
`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robotsTxt = generateRobotsTxt();

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
  res.write(robotsTxt);
  res.end();

  return {
    props: {},
  };
};

export default function Robots() {
  return null;
}
