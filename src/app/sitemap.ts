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

  // Every product gets the same priority. The previous version boosted four
  // hardcoded product names and quietly deprioritized everything else
  // (including the asbestos gasket page) - sitemap priority is a weak signal
  // to begin with, and picking favorites here just adds an arbitrary bias
  // that isn't backed by real traffic or business data.
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...productRoutes];
}