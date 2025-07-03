'use client'
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import ClientLogo from './ClientLogo'
import styles from './Clients.module.css'

const clients = [
  { name: "IndianOil", logo: "/home-images/IndianOil.png" },
  { name: "BPCL", logo: "/home-images/BPCL.png" },
  { name: "HPCL", logo: "/home-images/hpcl.png" },
  { name: "Jash India", logo: "/home-images/jash.png" },
  { name: "LanXess", logo: "/home-images/LanXess.png" },
  { name: "Unichem", logo: "/home-images/Unichem.png" },
  { name: "SRF", logo: "/home-images/SRF.png" },
  { name: "Force Motors", logo: "/home-images/ForceMotors.png" }
]

export default function ClientsSection() {
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
        <h2 className={styles.sectionTitle}>Our Valued Clients</h2>
        <p className={styles.sectionSubtitle}>We're proud to work with these amazing companies</p>
        
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
              <ClientLogo 
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