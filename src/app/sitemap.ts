import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date().toISOString();

  return [
    {
      url: 'https://www.hydel.co.in',
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.hydel.co.in/aboutus',
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.hydel.co.in/products',
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.hydel.co.in/contactus',
      lastModified: lastMod,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
