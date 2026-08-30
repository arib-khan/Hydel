import { Carousel, ClientsSection } from './components'
import ProductsSection from './components/Products/ProductsSection'
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton'
import { listPublicSlides } from '@/lib/repositories/carouselRepository'
import type { PublicCarouselSlide } from '@/types/carousel'

// The homepage carousel is managed from the admin panel. Revalidate
// periodically so slide changes show up without a full redeploy (matches the
// products page strategy).
export const revalidate = 60;

export const metadata = {
  title: 'Hydel Marketing & Services | Premium Industrial Gaskets & Sealing Solutions',
  description: 'Leading provider of industrial gaskets, sealing solutions, and marketing services. Trusted by major industries since 2008.',
  alternates: {
    canonical: 'https://www.hydel.co.in',
  },
  openGraph: {
    title: 'Hydel Marketing & Services | Industrial Sealing Solutions Expert',
    description: 'Trusted manufacturer of graphite, rubber, and spiral wound gaskets for demanding industrial applications',
    url: 'https://www.hydel.co.in',
    siteName: 'Hydel Marketing & Services',
    images: [
      {
        url: 'https://www.hydel.co.in/hydel.png',
        width: 1200,
        height: 630,
        alt: 'Hydel Marketing & Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  keywords: [
    'industrial gasket manufacturer',
    'graphite gasket supplier',
    'rubber seals India',
    'asbestos-free gaskets',
    'high pressure sealing solutions',
    'oil and gas gaskets',
    'hydraulic seals manufacturer'
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
}

export default async function Home() {
  // Fetch admin-managed carousel slides on the server. Falls back to the
  // component's built-in defaults if none are configured, and never lets a
  // transient data error take down the homepage.
  let slides: PublicCarouselSlide[] = [];
  try {
    const rawSlides = await listPublicSlides();
    slides = rawSlides.map((s) => ({ type: s.type, src: s.src, alt: s.alt }));
  } catch (err) {
    console.error('[home] failed to load carousel slides; using defaults', err);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hydel Marketing & Services",
    "url": "https://www.hydel.co.in",
    "logo": "https://www.hydel.co.in/hydel.png",
    "foundingDate": "2008",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9827059392",
      "contactType": "Customer Service"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        {/* Add semantic sectioning */}
        <section aria-label="Featured products showcase">
          {/* The homepage previously had no <h1> at all - the carousel is
              pure image/video with no text - which is a basic on-page SEO
              gap (search engines use the h1 as a strong signal for what the
              page is about, and this is the page most likely to rank for
              the brand + core category query).
              Note: this project's Tailwind directives are commented out in
              globals.css (only /admin is actually built with Tailwind), so
              a "sr-only" class would render as plain visible text here -
              using the standard visually-hidden inline style instead so it
              helps SEO/screen readers without changing how the hero looks. */}
          <h1
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            Hydel Marketing &amp; Services – Industrial Gaskets &amp; Sealing Solutions Manufacturer in India
          </h1>
          <Carousel slides={slides} />
        </section>

        <section aria-label="Our trusted clients">
          <ClientsSection />
        </section>

        <section aria-label="Our product range">
          <ProductsSection />
        </section>

        <WhatsAppButton />
      </main>
    </>
  )
}