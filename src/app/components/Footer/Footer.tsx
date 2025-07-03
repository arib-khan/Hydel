// components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaLinkedin, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.grid}>
          
          {/* Company Logo and Description */}
          <div className={styles.logoSection}>
            <div className={styles.logoContainer}>
              <Image
                src="/hydel-logo.png" // Replace with your logo path
                alt="Hydel Industries Logo"
                width={120}
                height={60}
                className={styles.logo}
              />
            </div>
            <p className={styles.description}>
              Providing high-quality industrial sealing solutions since 2008. 
              We manufacture premium gaskets and seals for demanding applications worldwide.
            </p>
            <div className={styles.socialIcons}>
              <a href="#" className={styles.socialLink}>
                <FaFacebook className={styles.icon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FaLinkedin className={styles.icon} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FaTwitter className={styles.icon} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linksList}>
              <li><Link href="/" className={styles.link}>Home</Link></li>
              <li><Link href="/products" className={styles.link}>Products</Link></li>
              <li><Link href="/aboutus" className={styles.link}>About Us</Link></li>
              <li><Link href="/contactus" className={styles.link}>Contact</Link></li>
              {/* <li><Link href="/blog" className={styles.link}>Blog</Link></li> */}
            </ul>
          </div>

          {/* Products */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Our Products</h3>
            <ul className={styles.linksList}>
              <li><Link href="/products" className={styles.link}>Graphite Gaskets</Link></li>
              <li><Link href="/products" className={styles.link}>Non-Asbestos Gaskets</Link></li>
              <li><Link href="/products" className={styles.link}>Rubber Gaskets</Link></li>
              <li><Link href="/products" className={styles.link}>Spiral Wound Gaskets</Link></li>
              <li><Link href="/products" className={styles.link}>Teflon Gaskets</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Contact Us</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span className={styles.contactText}>Indore, MP, India</span>
              </li>
              <li className={styles.contactItem}>
                <FaPhone className={styles.contactIcon} />
                <a href="tel:+918962463838" className={styles.contactLink}>+91-9827059392</a>
              </li>
              <li className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <a href="mailto:info@hydel.com" className={styles.contactLink}>hydel92@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Bottom Bar */}
        <div className={styles.copyright}>
          <p className={styles.copyrightText}>
            &copy; {new Date().getFullYear()} Hydel Marketing & Services. All rights reserved.
          </p>
          {/* <div className={styles.legalLinks}>
            <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
            <Link href="/sitemap" className={styles.legalLink}>Sitemap</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;