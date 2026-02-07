// app/products/[slug]/ProductGallery.tsx
'use client';

import { useState, useRef, MouseEvent } from 'react';
import styles from './ProductDetail.module.css';

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

export default function ProductGallery({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [showZoom, setShowZoom] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  
  // For now, we'll use the same image, but this structure allows for multiple images
  const images = [product.image];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Lens size (matches CSS)
    const lensWidth = 80;
    const lensHeight = 80;

    // Calculate lens position (keep it within bounds)
    let lensX = x - lensWidth / 2;
    let lensY = y - lensHeight / 2;

    // Boundary checks
    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > rect.width - lensWidth) lensX = rect.width - lensWidth;
    if (lensY > rect.height - lensHeight) lensY = rect.height - lensHeight;

    setLensPosition({ x: lensX, y: lensY });

    // Calculate zoom position for bottom-left corner preview
    // The zoom window is 200x200, showing magnified content
    const zoomLevel = 4;
    const zoomX = -(lensX * zoomLevel);
    const zoomY = -(lensY * zoomLevel);

    setZoomPosition({ x: zoomX, y: zoomY });
  };

  const handleMouseEnter = () => {
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  return (
    <div className={styles.gallerySection}>
      <div 
        ref={imageRef}
        className={styles.mainImageContainer}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img 
          src={selectedImage} 
          alt={product.name}
          className={styles.mainImage}
        />
        
        {showZoom && (
          <>
            {/* Zoom Lens */}
            <div 
              className={styles.zoomLens}
              style={{
                left: `${lensPosition.x}px`,
                top: `${lensPosition.y}px`,
              }}
            />
            
            {/* Zoomed Result */}
            <div className={styles.zoomResult}>
              <img
                src={selectedImage}
                alt={`${product.name} zoomed`}
                style={{
                  width: `${imageRef.current ? imageRef.current.offsetWidth * 4 : 0}px`,
                  height: `${imageRef.current ? imageRef.current.offsetHeight * 4 : 0}px`,
                  left: `${zoomPosition.x}px`,
                  top: `${zoomPosition.y}px`,
                }}
              />
            </div>
          </>
        )}

        <div className={styles.imageOverlay}>
          <span className={styles.zoomHint}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M11 8V14M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Hover to zoom
          </span>
        </div>
      </div>
      
      {images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          {images.map((img, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${selectedImage === img ? styles.activeThumbnail : ''}`}
              onClick={() => setSelectedImage(img)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={img} alt={`${product.name} view ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}