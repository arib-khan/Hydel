// components/ProductCard.tsx
'use client';

import styles from './Products.module.css';

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
  
  const handleQuoteRequest = () => {
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

  return (
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
          {/* <p className={styles.productPrice}>${product.price.toFixed(2)}</p> */}
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
        
        <button 
          className={styles.addToCartButton}
          onClick={handleQuoteRequest}
          aria-label={`Request quote for ${product.name}`}
        >
          <span>Request Quote</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}