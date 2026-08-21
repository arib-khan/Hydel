'use client'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import styles from './Navbar.module.css'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    document.body.classList.toggle('menu-open')
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.classList.remove('menu-open')
  }

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link href="/">
  <Image
    src="/hydel-logo.png"
    alt="Hydel Logo"
    width={150}
    height={50}
    priority
    sizes="(max-width: 768px) 100px, 150px"
    style={{ height: 'auto', width: 'auto' }}
  />
</Link>
        </div>
        
        <ul className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          <li>
            <Link 
              href="/" 
              className={pathname === '/' ? styles.active : ''}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/products" 
              className={pathname.startsWith('/products') ? styles.active : ''}
              onClick={closeMenu}
            >
              Products
            </Link>
          </li>
          <li>
            <Link 
              href="/aboutus" 
              className={pathname.startsWith('/aboutus') ? styles.active : ''}
              onClick={closeMenu}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link 
              href="/contactus" 
              className={pathname.startsWith('/contactus') ? styles.active : ''}
              onClick={closeMenu}
            >
              Contact Us
            </Link>
          </li>
        </ul>
        
        <div className={styles.hamburger} onClick={toggleMenu}>
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </div>
      </nav>
    </header>
  )
}