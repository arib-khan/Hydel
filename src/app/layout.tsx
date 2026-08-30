import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PublicChrome from './components/PublicChrome';
import { listPublicProducts } from '@/lib/repositories/productRepository';

const inter = Inter({ subsets: ['latin'] });

// Every canonical URL, OG URL, and sitemap entry elsewhere in the site uses
// the www subdomain (e.g. https://www.hydel.co.in/products/...), so the
// site-wide metadataBase/OG/icons need to match it. Mixing apex and www
// origins across a site's own metadata is the kind of inconsistency that
// makes crawlers treat the two as separate, weaker signals instead of one
// consolidated domain.
export const metadata: Metadata = {
  title: {
    default: 'Hydel Marketing & Services | Premium Industrial Sealing Solutions',
    template: '%s | Hydel'
  },
  description: 'Leading manufacturer of high-quality gaskets, seals, and industrial sealing solutions since 1998.',
  keywords: ['industrial seals', 'gaskets', 'hydraulic seals', 'rubber gaskets', 'industrial solutions'],
  authors: [{ name: 'Hydel Marketing & Services' }],
  alternates: {
    canonical: 'https://www.hydel.co.in',
  },
  openGraph: {
    title: 'Hydel Marketing & Services',
    description: 'Premium industrial sealing solutions for demanding applications',
    url: 'https://www.hydel.co.in',
    siteName: 'Hydel',
    images: [
      {
        url: 'https://www.hydel.co.in/hydel.png',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  icons: {
    icon: 'https://www.hydel.co.in/hydel.png',
    shortcut: 'https://www.hydel.co.in/hydel.png',
    apple: 'https://www.hydel.co.in/hydel.png',
  },
  metadataBase: new URL('https://www.hydel.co.in'),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetched here (a server component) and handed down through PublicChrome
  // so the footer's product links - and therefore every page's internal
  // linking - stay in sync with the real catalog instead of a hardcoded list.
  let footerProducts: { slug: string; name: string }[] = [];
  try {
    const products = await listPublicProducts();
    footerProducts = products.map((p) => ({ slug: p.slug, name: p.name }));
  } catch (err) {
    console.error('[layout] failed to load products for footer links', err);
  }

  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="QkZhPeF_NTIMU5gNH-zcJdcbrFdPg5cyUKr92Iokh6s" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <PublicChrome footerProducts={footerProducts}>{children}</PublicChrome>
      </body>
    </html>
  );
}