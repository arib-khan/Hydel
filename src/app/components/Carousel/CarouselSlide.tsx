'use client'

import { useEffect, useRef } from 'react'
import styles from './Carousel.module.css'

interface CarouselSlideProps {
  type: 'image' | 'video'
  src: string
  alt: string
  isActive: boolean
}

export default function CarouselSlide({ type, src, alt, isActive }: CarouselSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(e => console.error(e))
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive, type])

  return (
    <div className={`${styles.carouselSlide} ${isActive ? styles.active : ''}`}>
      {type === 'image' ? (
        <img src={src} alt={alt} className={styles.slideMedia} />
      ) : (
        <video 
          ref={videoRef}
          className={styles.slideMedia}
          muted 
          loop 
          playsInline
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}