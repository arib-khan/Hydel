// app/sitemap.ts
import { MetadataRoute } from 'next'
import products from '../app/products/products.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://www.hydel.in',
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.hydel.in/aboutus',
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.hydel.in/products',
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.hydel.in/contactus',
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Generate product URLs dynamically
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `https://www.hydel.in/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: lastMod,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}