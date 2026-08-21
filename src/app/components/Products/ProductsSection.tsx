'use client';
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import ProductLogo from './ProductsLogo'
import styles from './Products.module.css'

const clients = [
  { name: "Graphite gasket", logo: "/home-images/Graphite-Gasket.png" },
  { name: "Asbestos gasket", logo: "/home-images/Asbestos-Gasket.png" },
  { name: "Non Asbestos gasket", logo: "/home-images/Non-Asbestos-Gasket.png" }, 
  { name: "Ceramic gasket", logo: "/home-images/Ceramic-Gasket.png" },
  { name: "Rubber gasket", logo: "/home-images/Rubber-Gasket.png" },
  { name: "Spiral wound gasket", logo: "/home-images/Spiral-Wound-Gasket.png" },
  { name: "Teflon gasket", logo: "/home-images/Teflon-Gasket.png" },
  { name: "Rappit bandages", logo: "/home-images/Rappit-Bandages.png" },
  { name: "Oil seal ring", logo: "/home-images/oil-seal-ring.png" }
];
export default function ProductsSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentPosition, setCurrentPosition] = useState(0)
  const animationRef = useRef<number | null>(null) // Changed to number | null
  const [autoScrollSpeed] = useState(0.8)
  const [direction] = useState(-1)
  const scrollWidth = 280 + 40 // item width + gap

  // Create all client items (duplicated for seamless looping)
  const doubledClients = [...clients, ...clients]

  const autoScroll = () => {
    setCurrentPosition(prev => {
      let newPosition = prev + direction * autoScrollSpeed
      
      // Reset position when reaching the "seam" between original and duplicated items
      if (direction === -1 && newPosition <= -clients.length * scrollWidth) {
        return 0
      } else if (direction === 1 && newPosition >= 0) {
        return -clients.length * scrollWidth
      }
      return newPosition
    })
    
    animationRef.current = requestAnimationFrame(autoScroll)
  }

  const slideNext = () => {
    setCurrentPosition(prev => {
      const newPosition = prev - scrollWidth * 2
      return newPosition <= -clients.length * scrollWidth ? 0 : newPosition
    })
  }

  const slidePrev = () => {
    setCurrentPosition(prev => {
      const newPosition = prev + scrollWidth * 2
      return newPosition >= 0 ? -clients.length * scrollWidth : newPosition
    })
  }

  useEffect(() => {
    animationRef.current = requestAnimationFrame(autoScroll)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <section className={styles.clientsSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Our Products</h2>
        <p className={styles.sectionSubtitle}>High-performance gaskets and seals for demanding applications</p>
        
        <div className={styles.clientsContainer}>
          <div 
            className={styles.clientsTrack}
            ref={trackRef}
            style={{ transform: `translateX(${currentPosition}px)` }}
            onMouseEnter={() => {
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
              }
            }}
            onMouseLeave={() => {
              if (!animationRef.current) {
                animationRef.current = requestAnimationFrame(autoScroll)
              }
            }}
          >
            {doubledClients.map((client, index) => (
              <ProductLogo 
                key={`${client.name}-${index}`}
                name={client.name}
                logo={client.logo}
              />
            ))}
          </div>
        </div>
        
        <div className={styles.clientControls}>
          <button className={styles.clientPrev} onClick={slidePrev}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button className={styles.clientNext} onClick={slideNext}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </section>
  )
}