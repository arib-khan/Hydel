'use client'
import { useEffect, useRef, useState } from 'react'
import CarouselSlide from './CarouselSlide'
import styles from './Carousel.module.css'

type SlideType = "video" | "image";

interface Slide {
  type: SlideType;
  src: string;
  alt: string;
}

const slides: Slide[] = [
  {
    type: 'video',
    src: '/home-images/carousel-video.mp4',
    alt: 'Slide 1'
  },
  {
    type: 'image',
    src: '/home-images/carousel-image.png',
    alt: 'Slide 2'
  }
]

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartXRef = useRef<number>(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const startAutoplay = () => {
    stopAutoplay() // Clear any existing interval
    intervalRef.current = window.setInterval(nextSlide, 5000)
  }

  const stopAutoplay = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    startAutoplay()
    return () => stopAutoplay()
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    if (touchEndX < touchStartXRef.current - 50) {
      nextSlide()
    } else if (touchEndX > touchStartXRef.current + 50) {
      prevSlide()
    }
  }

  // Static text content
  const staticTitle = "Hydel Marketing & Services";
  const staticContent = "Since 2008, Hydel Marketing & Services has been a premier provider of industrial gaskets and sealing solutions. Our high-quality products including asbestos gaskets, rubber gaskets, graphite gaskets, and specialized sealing materials are trusted by major industries across India. We serve sectors like oil & gas, automotive, chemical processing, and more with reliable sealing solutions that ensure optimal performance and safety.";

  return (
    <div 
      className={styles.carouselContainer}
      ref={carouselRef}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dark overlay */}
      <div className={styles.carouselOverlay}></div>
      
      {/* Static text content */}
      <div className={styles.carouselTextContent}>
        <h2 className={styles.carouselTextH}>{staticTitle}</h2>
        <p className={styles.carouselTextP}>{staticContent}</p>
      </div>

      <div 
        className={styles.carouselSlides}
        style={{ transform: `translateX(-${currentIndex * 100}%` }}
      >
        {slides.map((slide, index) => (
          <CarouselSlide 
            key={index}
            type={slide.type}
            src={slide.src}
            alt={slide.alt}
            isActive={index === currentIndex}
          />
        ))}
      </div>
      
      <button 
        className={`${styles.carouselControl} ${styles.prev}`}
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        &#10094;
      </button>
      <button 
        className={`${styles.carouselControl} ${styles.next}`}
        onClick={nextSlide}
        aria-label="Next slide"
      >
        &#10095;
      </button>
      
      <div className={styles.carouselIndicators}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.carouselIndicator} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}