// app/products/ProductCard.tsx
'use client';

import styles from './Products.module.css';
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

export default function ProductCard({ product }: { product: Product }) {
  // Replace with your actual WhatsApp number (include country code without + sign)
  const whatsappNumber = '919827059392';
  
  const handleQuoteRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let message = `Hello! I'm interested in purchasing:\n\n`;
    message += `*Product:* ${product.name}\n`;
    message += `*Description:* ${product.description}\n`;
    message += `*Material:* ${product.material}\n`;
    if (product.colors) message += `*Color Options:* ${product.colors.join(', ')}\n`;
    if (product.sizes) message += `*Size Options:* ${product.sizes?.join(', ')}\n\n`;
    message += `Please provide availability and pricing details.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  const slug = product.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link href={`/products/${slug}`} className={styles.productCardLink}>
      <div className={styles.productCard}>
        <div className={styles.productImageContainer}>
          <img 
            src={product.image} 
            alt={product.name} 
            className={styles.productImage}
            loading="lazy"
          />
          {product.customizable && (
            <span className={styles.customBadge}>Customizable</span>
          )}
        </div>
        <div className={styles.productDetails}>
          <div className={styles.productHeader}>
            <h2>{product.name}</h2>
          </div>
          
          <p className={styles.productDescription}>{product.description}</p>
          
          <div className={styles.productSpecs}>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Material:</span>
              <span>{product.material}</span>
            </div>
            
            {product.colors && (
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Colors:</span>
                <div className={styles.colorChips}>
                  {product.colors.map(color => (
                    <span 
                      key={color} 
                      className={styles.colorChip}
                      style={{backgroundColor: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase()}}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {product.sizes && (
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Sizes:</span>
                <span>{product.sizes.join(', ')}</span>
              </div>
            )}
          </div>
          
          <div className={styles.cardActions}>
            <button 
              className={styles.viewDetailsButton}
              aria-label={`View details for ${product.name}`}
            >
              View Details
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={styles.quickQuoteButton}
              onClick={handleQuoteRequest}
              aria-label={`Request quote for ${product.name}`}
              title="Quick quote via WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}