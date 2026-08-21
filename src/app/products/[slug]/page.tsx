// app/products/[slug]/page.tsx - SEO OPTIMIZED VERSION
import { Navbar } from '../../components';
import styles from './ProductDetail.module.css';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import RelatedProducts from './RelatedProducts';
import ProductGallery from './ProductGallery';
import QuoteButton from './QuoteButton';
import { getPublicProductBySlug, listPublicProducts } from '@/lib/repositories/productRepository';

// Products now live in Firestore; re-check periodically instead of only at build time.
export const revalidate = 60;

// Generate static params for all products at build time (Firestore-backed).
export async function generateStaticParams() {
  const products = await listPublicProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Generate metadata for SEO - ENHANCED VERSION
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  // Enhanced title with location and year
  const title = `${product.name} - ${product.material} | Hydel India 2025`;
  
  // Enhanced description with keywords and CTA
  const description = product.fullDescription 
    ? `${product.fullDescription.substring(0, 140)}... ✓ ISO Certified ✓ Fast Delivery ✓ Best Prices. Request Quote Now!`
    : `Buy premium ${product.name.toLowerCase()} made from ${product.material}. ${product.description} ✓ Industrial grade ✓ Custom sizes available. Contact us today!`;

  // Comprehensive keywords including long-tail
  const keywords = [
    product.name,
    `${product.name} price`,
    `buy ${product.name}`,
    `${product.name} supplier`,
    `${product.name} manufacturer`,
    product.material,
    `${product.material} gasket`,
    'industrial gaskets',
    'sealing solutions',
    'gasket supplier India',
    'industrial seals',
    ...(product.applications || []),
    ...(product.sizes || []).map(size => `${product.name} ${size}`),
    product.temperatureRange ? `${product.temperatureRange} gasket` : '',
  ].filter(Boolean);

  return {
    title: title,
    description: description,
    keywords: keywords,
    authors: [{ name: 'Hydel Marketing & Services' }],
    alternates: {
      canonical: `https://www.hydel.co.in/products/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Premium ${product.material} Gaskets`,
      description: description,
      url: `https://www.hydel.co.in/products/${slug}`,
      siteName: 'Hydel Marketing & Services',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: `https://www.hydel.co.in${product.image}`,
          width: 1200,
          height: 630,
          alt: `${product.name} - ${product.material}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [`https://www.hydel.co.in${product.image}`],
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
      },
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get related products (same material or category)
  const allProducts = await listPublicProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.material === product.material)
    .slice(0, 3);

  // Enhanced Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.fullDescription || product.description,
    "image": [
      `https://www.hydel.co.in${product.image}`
    ],
    "brand": {
      "@type": "Brand",
      "name": "Hydel Marketing & Services",
      "logo": "https://www.hydel.co.in/hydel.png"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Hydel Marketing & Services",
      "url": "https://www.hydel.co.in"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Hydel Marketing & Services"
      },
      "priceValidUntil": "2025-12-31",
      "url": `https://www.hydel.co.in/products/${slug}`
    },
    "material": product.material,
    "category": "Industrial Gaskets & Seals",
    "sku": `HYDEL-${product.legacyId ?? product.slug}`,
    "gtin": `HYD${String(product.legacyId ?? 0).padStart(10, '0')}`,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Customizable",
        "value": product.customizable ? "Yes" : "No"
      },
      product.temperatureRange ? {
        "@type": "PropertyValue",
        "name": "Temperature Range",
        "value": product.temperatureRange
      } : null,
      product.pressureRating ? {
        "@type": "PropertyValue",
        "name": "Pressure Rating",
        "value": product.pressureRating
      } : null,
    ].filter(Boolean),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.hydel.co.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://www.hydel.co.in/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://www.hydel.co.in/products/${slug}`
      }
    ]
  };

  // FAQ Schema for product
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${product.name} used for?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${product.name} is used for ${product.applications?.slice(0, 3).join(', ').toLowerCase() || 'industrial sealing applications'}. It provides reliable sealing in ${product.temperatureRange || 'various temperature'} conditions.`
        }
      },
      {
        "@type": "Question",
        "name": `What material is ${product.name} made of?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${product.name} is made from high-quality ${product.material}, which offers ${product.features?.[0]?.toLowerCase() || 'excellent performance and durability'}.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I get custom sizes for ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": product.customizable 
            ? `Yes, ${product.name} is available in custom sizes and specifications. Contact us for your specific requirements.`
            : `Standard sizes are available. Please contact us for specific size requirements.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the temperature range for ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${product.name} can withstand temperatures ranging from ${product.temperatureRange || 'various industrial temperature ranges'}. This makes it suitable for ${product.applications?.[0] || 'high-temperature industrial applications'}.`
        }
      }
    ]
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hydel Marketing & Services",
    "url": "https://www.hydel.co.in",
    "logo": "https://www.hydel.co.in/hydel.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9827059392",
      "contactType": "Customer Service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/hydelmarketing",
      "https://www.linkedin.com/company/hydel-marketing"
    ]
  };

  return (
    <>
      {/* Multiple Structured Data Scripts */}
      <Script
        type="application/ld+json"
        id="product-schema"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        type="application/ld+json"
        id="breadcrumb-schema"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        type="application/ld+json"
        id="faq-schema"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        type="application/ld+json"
        id="organization-schema"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <Navbar />
      
      <main className={styles.productDetailContainer}>
        {/* Breadcrumb with enhanced markup */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
          <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href="/" itemProp="item">
              <span itemProp="name">Home</span>
            </a>
            <meta itemProp="position" content="1" />
          </span>
          <span className={styles.separator}>/</span>
          <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href="/products" itemProp="item">
              <span itemProp="name">Products</span>
            </a>
            <meta itemProp="position" content="2" />
          </span>
          <span className={styles.separator}>/</span>
          <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span className={styles.current} itemProp="name">{product.name}</span>
            <meta itemProp="position" content="3" />
          </span>
        </nav>

        <div className={styles.productLayout}>
          {/* Left: Image Gallery */}
          <ProductGallery product={product} />

          {/* Right: Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              {/* H1 with product name - PRIMARY KEYWORD */}
              <h1>{product.name} - Premium {product.material} Gasket</h1>
              {product.customizable && (
                <span className={styles.customBadge}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                          fill="currentColor"/>
                  </svg>
                  Customizable
                </span>
              )}
            </div>

            {/* Short description with keywords */}
            <p className={styles.productDescription}>
              {product.description} Our {product.name.toLowerCase()} is manufactured using high-grade {product.material} for superior performance in demanding industrial applications.
            </p>
            
            {/* Full description - SEO-rich content */}
            {product.fullDescription && (
              <div className={styles.fullDescriptionSection}>
                <h2>About This {product.material} Gasket</h2>
                <p>{product.fullDescription}</p>
                <p>
                  As a leading {product.name.toLowerCase()} manufacturer in India, 
                  we ensure ISO-certified quality and fast delivery across the country. 
                  Our {product.material} gaskets are trusted by industries for their 
                  reliability and long service life.
                </p>
              </div>
            )}

            {/* Key Specifications */}
            <div className={styles.specsSection}>
              <h2>{product.name} Specifications</h2>
              
              <div className={styles.specGrid}>
                <div className={styles.specItem}>
                  <div className={styles.specIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 9H21M9 3V21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.specLabel}>Material Composition</div>
                    <div className={styles.specValue}>{product.material}</div>
                  </div>
                </div>

                {product.temperatureRange && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M14 14.76V3.5C14 2.67 13.33 2 12.5 2C11.67 2 11 2.67 11 3.5V14.76C9.78 15.37 9 16.62 9 18C9 20.21 10.79 22 13 22C15.21 22 17 20.21 17 18C17 16.62 16.22 15.37 15 14.76Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <div className={styles.specLabel}>Operating Temperature</div>
                      <div className={styles.specValue}>{product.temperatureRange}</div>
                    </div>
                  </div>
                )}

                {product.pressureRating && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className={styles.specLabel}>Maximum Pressure</div>
                      <div className={styles.specValue}>{product.pressureRating}</div>
                    </div>
                  </div>
                )}

                {product.colors && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 3C7.03 3 3 7.03 3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className={styles.specLabel}>Available Colors</div>
                      <div className={styles.colorOptions}>
                        {product.colors.map(color => (
                          <span 
                            key={color}
                            className={styles.colorChip}
                            style={{backgroundColor: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase()}}
                            title={color}
                            aria-label={`${color} color option`}
                          >
                            <span className={styles.colorName}>{color}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {product.sizes && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M4 8H20M4 16H20M8 4L8 20M16 4L16 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className={styles.specLabel}>Available Sizes</div>
                      <div className={styles.specValue}>{product.sizes.join(', ')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Specifications */}
            {product.technical && (
              <div className={styles.technicalSection}>
                <h2>Technical Data Sheet</h2>
                <div className={styles.technicalGrid}>
                  {Object.entries(product.technical).map(([key, value]) => (
                    <div key={key} className={styles.technicalItem}>
                      <span className={styles.techLabel}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </span>
                      <span className={styles.techValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications - important for SEO */}
            {product.applications && product.applications.length > 0 && (
              <div className={styles.applicationsSection}>
                <h2>Industrial Applications of {product.name}</h2>
                <p className={styles.applicationsIntro}>
                  Our {product.name.toLowerCase()} is ideal for various industrial sectors and applications:
                </p>
                <div className={styles.applicationsGrid}>
                  {product.applications.map((app, index) => (
                    <div key={index} className={styles.applicationCard}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 7L9 18L4 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            <div className={styles.featuresSection}>
              <h2>Why Choose Our {product.name}?</h2>
              <ul className={styles.featuresList}>
                {product.features ? (
                  product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))
                ) : (
                  <>
                    <li>Premium {product.material} construction for long-lasting performance</li>
                    <li>Engineered for demanding industrial applications</li>
                    <li>Superior sealing performance and reliability</li>
                    {product.customizable && <li>Custom sizes and specifications available on request</li>}
                    <li>Meets international industry standards and certifications</li>
                    <li>ISO-certified manufacturing process</li>
                  </>
                )}
              </ul>
            </div>

            {/* Standards & Compliance */}
            {product.standards && product.standards.length > 0 && (
              <div className={styles.standardsSection}>
                <h3>Industry Standards & Certifications</h3>
                <div className={styles.standardsBadges}>
                  {product.standards.map((standard, index) => (
                    <span key={index} className={styles.standardBadge}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                              stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {standard}
                    </span>
                  ))}
                </div>
                {product.compliance && (
                  <p className={styles.complianceNote}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {product.compliance}
                  </p>
                )}
              </div>
            )}

            {/* CTA Button */}
            <QuoteButton product={product} />

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={styles.badge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>ISO Certified Quality</span>
              </div>
              <div className={styles.badge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Industry Standards Compliant</span>
              </div>
              <div className={styles.badge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Fast Delivery Pan-India</span>
              </div>
            </div>

            {/* FAQ Section for SEO */}
            <div className={styles.faqSection}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.faqList} itemScope itemType="https://schema.org/FAQPage">
                <div className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">What is {product.name} used for?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      {product.name} is primarily used for {product.applications?.slice(0, 3).join(', ').toLowerCase() || 'industrial sealing applications'}. 
                      It provides reliable sealing in {product.temperatureRange || 'various temperature'} conditions.
                    </p>
                  </div>
                </div>

                <div className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">What material is {product.name} made of?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      {product.name} is manufactured from premium {product.material}, which offers {product.features?.[0]?.toLowerCase() || 'excellent performance and durability'}.
                    </p>
                  </div>
                </div>

                <div className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">Can I get custom sizes?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      {product.customizable 
                        ? `Yes, ${product.name} is available in custom sizes and specifications. Contact us for your specific requirements.`
                        : `Standard sizes are available. Please contact us to discuss your specific size requirements.`}
                    </p>
                  </div>
                </div>

                <div className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">What is the delivery time?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      We offer fast delivery across India. Standard products are typically delivered within 3-7 business days. 
                      Custom orders may take 10-15 days depending on specifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>
    </>
  );
}