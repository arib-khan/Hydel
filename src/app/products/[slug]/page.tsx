// app/products/[slug]/page.tsx
import { Navbar } from '../../components';
import styles from './ProductDetail.module.css';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import products from '../products.json';
import RelatedProducts from './RelatedProducts';
import ProductGallery from './ProductGallery';
import QuoteButton from './QuoteButton';

// Generate static params for all products
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(
    (p) => p.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Industrial Gaskets & Seals`,
    description: product.fullDescription || product.description,
    alternates: {
      canonical: `https://www.hydel.co.in/products/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.fullDescription || product.description,
      url: `https://www.hydel.co.in/products/${slug}`,
      images: [
        {
          url: `https://www.hydel.co.in${product.image}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    keywords: [
      product.name,
      product.material,
      'industrial gaskets',
      'sealing solutions',
      ...(product.applications || []),
    ],
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(
    (p) => p.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!product) {
    notFound();
  }

  // Get related products (same material or category)
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.material === product.material)
    .slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.fullDescription || product.description,
    "image": `https://www.hydel.co.in${product.image}`,
    "brand": {
      "@type": "Brand",
      "name": "Hydel Marketing & Services"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "material": product.material,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Customizable",
        "value": product.customizable ? "Yes" : "No"
      }
    ]
  };

  return (
    <>
      <Script
        type="application/ld+json"
        id="product-structured-data"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navbar />
      
      <main className={styles.productDetailContainer}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className={styles.separator}>/</span>
          <a href="/products">Products</a>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{product.name}</span>
        </nav>

        <div className={styles.productLayout}>
          {/* Left: Image Gallery */}
          <ProductGallery product={product} />

          {/* Right: Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h1>{product.name}</h1>
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

            <p className={styles.productDescription}>{product.description}</p>
            
            {product.fullDescription && (
              <div className={styles.fullDescriptionSection}>
                <p>{product.fullDescription}</p>
              </div>
            )}

            {/* Key Specifications */}
            <div className={styles.specsSection}>
              <h2>Product Specifications</h2>
              
              <div className={styles.specGrid}>
                <div className={styles.specItem}>
                  <div className={styles.specIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 9H21M9 3V21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.specLabel}>Material</div>
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
                      <div className={styles.specLabel}>Temperature Range</div>
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
                      <div className={styles.specLabel}>Pressure Rating</div>
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
                <h2>Technical Data</h2>
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

            {/* Applications */}
            {product.applications && product.applications.length > 0 && (
              <div className={styles.applicationsSection}>
                <h2>Applications</h2>
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
              <h2>Key Features</h2>
              <ul className={styles.featuresList}>
                {product.features ? (
                  product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))
                ) : (
                  <>
                    <li>High-quality {product.material} construction</li>
                    <li>Designed for industrial applications</li>
                    <li>Superior sealing performance</li>
                    {product.customizable && <li>Custom sizes and specifications available</li>}
                    <li>Meets industry standards and certifications</li>
                  </>
                )}
              </ul>
            </div>

            {/* Standards & Compliance */}
            {product.standards && product.standards.length > 0 && (
              <div className={styles.standardsSection}>
                <h3>Standards & Certifications</h3>
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
                <span>Quality Assured</span>
              </div>
              <div className={styles.badge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Industry Standard</span>
              </div>
              <div className={styles.badge}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Fast Delivery</span>
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