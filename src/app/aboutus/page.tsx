// 'use client';
import AboutUs from './AboutUs';
import { FaShieldAlt, FaCalendarAlt, FaHeadset, FaTrophy } from 'react-icons/fa';
import styles from './WhyChooseUs.module.css';
import Script from 'next/script';


export const metadata = {
  title: 'Why Choose Hydel Marketing & Services | Industrial Gaskets & Seals',
  description: 'Discover why Hydel Marketing & Services is the trusted provider of premium industrial gaskets and sealing solutions.',
  alternates: {
    canonical: 'https://www.hydel.co.in/aboutus',
  },
  openGraph: {
    title: 'Why Choose Hydel Marketing & Services',
    description: 'Trusted supplier of industrial sealing solutions with quality, expertise, and customer support.',
    url: 'https://www.hydel.co.in/aboutus',
    images: [
      {
        url: 'https://www.hydel.co.in/hydel.png',
        width: 1200,
        height: 630,
        alt: 'Hydel Why Choose Us',
      },
    ],
  },
  keywords: [
    'industrial gaskets supplier',
    'sealing solutions provider',
    'trusted industrial gasket manufacturer',
    'Hydel Marketing services',
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Why Choose Hydel Marketing & Services",
  "description": "Trusted supplier of industrial gaskets and sealing solutions.",
  "url": "https://www.hydel.co.in/aboutus"
};
  
export default function WhyChooseUsPage() {
  return (
    <>
     <Script
        type="application/ld+json"
        id="structured-data"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutUs />
       <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Why Choose Hydel?</h2>
        <p className={styles.subheading}>Premium industrial solutions with unmatched benefits</p>
        <div className={styles.divider}></div>
      </div>
      
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <FaShieldAlt className={styles.icon} />
          </div>
          <h3>Quality Guarantee</h3>
          <p>ISO-certified products with rigorous quality control for reliable performance.</p>
        </div>
        
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <FaTrophy className={styles.icon} />
          </div>
          <h3>Industry Leaders</h3>
          <p>15+ years of expertise in sealing technology and industrial solutions.</p>
        </div>
        
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <FaCalendarAlt className={styles.icon} />
          </div>
          <h3>Timely Delivery</h3>
          <p>Just-in-time inventory system ensures fast order fulfillment.</p>
        </div>
        
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <FaHeadset className={styles.icon} />
          </div>
          <h3>Technical Support</h3>
          <p>Dedicated engineering team available for consultation and troubleshooting.</p>
        </div>
      </div>
    </section>
    </>
  );
}
