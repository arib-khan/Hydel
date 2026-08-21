'use client'
import { useEffect, useRef, useState } from 'react'
import CarouselSlide from './CarouselSlide'
import styles from './Carousel.module.css'
import type { PublicCarouselSlide } from '@/types/carousel'

// Built‑in slides (fallback)
const DEFAULT_SLIDES: PublicCarouselSlide[] = [
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

interface CarouselProps {
  slides?: PublicCarouselSlide[]
}

// ----- Gasket Image Component (with spinning animation) -----
const spinKeyframes = `
  @keyframes hms-spin  { to { transform: rotate(360deg)  } }
  @keyframes hms-spinR { to { transform: rotate(-360deg) } }
`

function GasketImage({ src, size, duration, dir, alt }: {
  src: string
  size: number
  duration: number
  dir: 'cw' | 'ccw'
  alt: string
}) {
  const anim = dir === 'cw' ? 'hms-spin' : 'hms-spinR'
  return (
    <div
      style={{
        width: size,
        height: size,
        animation: `${anim} ${duration}s linear infinite`,
      }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.45))',
        }}
      />
    </div>
  )
}
// -------------------------------------------------------------

export default function Carousel({ slides: slidesProp }: CarouselProps = {}) {
  const slides =
    slidesProp && slidesProp.length > 0 ? slidesProp : DEFAULT_SLIDES

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
    stopAutoplay()
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

  const staticTitle = "Hydel Marketing & Services"
  const staticContent =
    "Since 2008, Hydel Marketing & Services has been a premier provider of industrial gaskets and sealing solutions. Our high-quality products including asbestos gaskets, rubber gaskets, graphite gaskets, and specialized sealing materials are trusted by major industries across India. We serve sectors like oil & gas, automotive, chemical processing, and more with reliable sealing solutions that ensure optimal performance and safety."

  return (
    <>
      {/* Inject spin keyframes */}
      <style>{spinKeyframes}</style>

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

        {/* ---- Rotating Gaskets (positioned absolutely) ---- */}
        <div className={styles.gasketLayer}>
          {/* Top‑left */}
          <div style={{ position: 'absolute', top: '-80px', left: '-80px' }}>
            <GasketImage
              src="/home-images/Rubber-Gasket.png"
              alt="Rubber Gasket"
              size={160}
              duration={13}
              dir="cw"
            />
          </div>
          {/* Top‑right */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px' }}>
            <GasketImage
              src="/home-images/Spiral-Wound-Gasket.png"
              alt="Spiral Wound Gasket"
              size={150}
              duration={10}
              dir="ccw"
            />
          </div>
          {/* Bottom‑left */}
          <div style={{ position: 'absolute', bottom: '-80px', left: '-80px' }}>
            <GasketImage
              src="/home-images/Graphite-Gasket.png"
              alt="Graphite Gasket"
              size={150}
              duration={8}
              dir="ccw"
            />
          </div>
          {/* Bottom‑right */}
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px' }}>
            <GasketImage
              src="/home-images/Ceramic-Gasket.png"
              alt="Ceramic Gasket"
              size={160}
              duration={11}
              dir="cw"
            />
          </div>
          {/* Left‑middle */}
          <div
            style={{
              position: 'absolute',
              left: '-100px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <GasketImage
              src="/home-images/Teflon-Gasket.png"
              alt="Teflon Gasket"
              size={120}
              duration={7}
              dir="cw"
            />
          </div>
          {/* Right‑middle */}
          <div
            style={{
              position: 'absolute',
              right: '-100px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <GasketImage
              src="/home-images/Non-Asbestos-Gasket.png"
              alt="Non-Asbestos Gasket"
              size={120}
              duration={9}
              dir="ccw"
            />
          </div>
          {/* Center hero */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* <GasketImage
              src="/home-images/oil-seal-ring.png"
              alt="Oil Seal Ring"
              size={140}
              duration={5}
              dir="cw"
            /> */}
          </div>
        </div>
        {/* ----------------------------------------------- */}

        {/* Static text content (above everything) */}
        <div className={styles.carouselTextContent}>
          <h2 className={styles.carouselTextH}>{staticTitle}</h2>
          <p className={styles.carouselTextP}>{staticContent}</p>
        </div>

        {/* Slides (background) */}
        <div
          className={styles.carouselSlides}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
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

        {/* Controls and indicators (unchanged) */}
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
    </>
  )
}