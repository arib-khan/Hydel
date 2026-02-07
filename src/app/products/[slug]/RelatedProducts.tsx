// app/products/[slug]/RelatedProducts.tsx
'use client';

import styles from './ProductDetail.module.css';
import Link from 'next/link';

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

export default function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <section className={styles.relatedSection}>
      <h2>You May Also Like</h2>
      <div className={styles.relatedGrid}>
        {products.map((product) => {
          const slug = product.name.toLowerCase().replace(/\s+/g, '-');
          return (
            <Link 
              href={`/products/${slug}`} 
              key={product.id}
              className={styles.relatedCard}
            >
              <div className={styles.relatedImageContainer}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  loading="lazy"
                />
                {product.customizable && (
                  <span className={styles.relatedBadge}>Customizable</span>
                )}
              </div>
              <div className={styles.relatedInfo}>
                <h3>{product.name}</h3>
                <p className={styles.relatedMaterial}>{product.material}</p>
                <span className={styles.viewDetails}>
                  View Details
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}