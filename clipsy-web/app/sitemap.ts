import type { MetadataRoute } from 'next';
import { getCampaigns } from '@/lib/data';

const BASE = 'https://clipsy.club';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['', '/clip', '/brands', '/enterprise', '/how-campaigns-work', '/campaigns', '/wire', '/learn', '/why-us', '/faq', '/contact'].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: (p === '' || p === '/campaigns' || p === '/wire' ? 'hourly' : 'weekly') as 'hourly' | 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  // Every live campaign is its own indexable page — this is the SEO surface.
  const campaigns = await getCampaigns('hot', 300);
  return [
    ...staticPages,
    ...campaigns.map((c) => ({
      url: `${BASE}/campaigns/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
  ];
}
