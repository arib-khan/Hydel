// app/sitemap.ts - SEO OPTIMIZED VERSION (Firestore-backed)
import { MetadataRoute } from 'next'
import { listPublicProducts } from '@/lib/repositories/productRepository'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastMod = new Date().toISOString();
  const baseUrl = 'https://www.hydel.co.in';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastMod,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: lastMod,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/aboutus`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contactus`,
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const products = await listPublicProducts();

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => {
    const isHighDemand = ['graphite gasket', 'rubber gasket', 'non asbestos gasket', 'spiral wound gasket']
      .some(keyword => product.name.toLowerCase().includes(keyword.toLowerCase()));

    return {
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: lastMod,
      changeFrequency: 'weekly' as const,
      priority: isHighDemand ? 0.9 : 0.85,
    };
  });

  return [...staticRoutes, ...productRoutes];
}
