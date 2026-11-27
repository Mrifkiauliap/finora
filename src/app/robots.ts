import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finora.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/features', '/about', '/privacy'],
        disallow: ['/app/', '/offline'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
