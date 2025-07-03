import { Carousel, ClientsSection } from './components'
import ProductsSection from './components/Products/ProductsSection'
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton'

export const metadata = {
  title: 'Hydel Marketing & Services | Premium Industrial Gaskets & Sealing Solutions',
  description: 'Leading provider of industrial gaskets, sealing solutions, and marketing services. Trusted by major industries since 2008.',
  alternates: {
    canonical: 'https://www.hydel.in',
  },
  openGraph: {
    title: 'Hydel Marketing & Services | Industrial Sealing Solutions Expert',
    description: 'Trusted manufacturer of graphite, rubber, and spiral wound gaskets for demanding industrial applications',
    url: 'https://www.hydel.in',
    siteName: 'Hydel Marketing & Services',
    images: [
      {
        url: '/og-image.jpg',
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

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hydel Marketing & Services",
    "url": "https://www.hydel.in",
    "logo": "https://www.hydel.in/logo.png",
    "foundingDate": "2008",
    "sameAs": [
      "https://www.facebook.com/hydelmarketing",
      "https://www.linkedin.com/company/hydel-marketing"
    ]
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
          <Carousel />
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