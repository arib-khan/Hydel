
import Image from 'next/image'
import styles from './Clients.module.css'
import { useEffect, useRef } from 'react'

interface ClientLogoProps {
  name: string
  logo: string
}

export default function ProductLogo({ name, logo }: ClientLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Clean up any existing fallback when the component mounts
    const container = containerRef.current
    if (container) {
      const existingFallback = container.querySelector(`.${styles.clientFallback}`)
      if (existingFallback) {
        container.removeChild(existingFallback)
      }
    }
  }, [])

  return (
    <div className={styles.clientItem} ref={containerRef}>
      <Image 
        src={logo} 
        alt={name}
        width={200}
        height={100}
        className={styles.clientLogo}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          
          // Check if fallback already exists
          const container = target.parentNode as HTMLDivElement
          const existingFallback = container.querySelector(`.${styles.clientFallback}`)
          
          if (!existingFallback) {
            const fallback = document.createElement('div')
            fallback.className = styles.clientFallback
            fallback.textContent = name
            container.appendChild(fallback)
          }
        }}
      />
    </div>
  )
}