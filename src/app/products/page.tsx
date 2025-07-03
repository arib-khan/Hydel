// app/products/page.tsx

import { Navbar } from '../components';
import styles from './Products.module.css';
import Script from 'next/script';
import ProductCard from './ProductCard';
import SimilarProductButton from './SimilarProductButton';
import products from './products.json';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": products.map((product, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.image,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "USD"
      }
    }
  }))
};

export const metadata = {
  title: 'Our Products | Industrial Gaskets & Seals',
  description: 'Explore our range of premium industrial gaskets including asbestos, rubber, graphite, and specialized sealing solutions.',
  alternates: {
    canonical: 'https://www.hydel.in/products',
  },
  openGraph: {
    title: 'Industrial Gaskets & Seals | Hydel Marketing & Services',
    description: 'Premium quality sealing solutions for industrial applications',
    url: 'https://www.hydel.in/products',
    images: [
      {
        url: 'https://www.hydel.in/hydel.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  keywords: [
    'industrial gaskets', 'graphite gaskets', 'rubber seals',
    'asbestos-free gaskets', 'high temperature gaskets',
    'oil seal rings', 'spiral wound gaskets'
  ],
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  material: string;
  customizable: boolean;
  colors?: string[];
  sizes?: string[];
}

export default function ProductsPage() {
  return (
    <>
      <Script
        type="application/ld+json"
        id="structured-data"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navbar />
      <main className={styles.productsContainer}>
        <h1>Industrial Sealing Solutions</h1>
        <p className={styles.pageSubtitle}>High-performance gaskets and seals for demanding applications</p>

        <div className={styles.productsGrid} role="list" aria-label="Product listings">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <SimilarProductButton />
    </>
  );
}