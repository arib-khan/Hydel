// app/aboutus/page.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './AboutUs.module.css';
import { Navbar } from '../components';

const AboutUsPage = () => {
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const setRef = (index: number) => (el: HTMLSpanElement | null) => {
    statRefs.current[index] = el;
  };

  useEffect(() => {
    const animateNumbers = () => {
      statRefs.current.forEach((element, index) => {
        if (!element) return;

        const target = [15, 150, 10000][index]; // Years, Clients, Products
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);

        let current = start;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            clearInterval(timer);
            current = target;
          }
          element.textContent = Math.floor(current).toLocaleString() + (index === 2 ? '+' : '+');
        }, 16);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNumbers();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    const container = document.querySelector(`.${styles.statsContainer}`);
    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <article className={styles.contentWrapper}>
          <section className={styles.textContent} aria-labelledby="about-heading">
            <header>
              <h1 id="about-heading" className={styles.title}>About Hydel Marketing & Services</h1>
              <div className={styles.divider} aria-hidden="true"></div>
            </header>

            <div className={styles.descriptionWrapper}>
              <p className={styles.description}>
                Since 2008, Hydel Marketing & Services has been a leading provider of comprehensive industrial solutions.
                Our commitment to excellence and innovative strategies has established us as a trusted partner for businesses across multiple industries.
              </p>
              <p className={styles.description}>
                We specialize in delivering customized solutions designed to drive indurtrial growth. Our data-driven strategies and industry expertise
                empower clients to exceed their objectives, optimize market reach, and gain a competitive edge.
              </p>
            </div>

            <aside className={styles.statsContainer} aria-label="Company achievements">
              <div className={styles.statItem}>
                <span
                  ref={setRef(0)}
                  className={styles.statNumber}
                  aria-live="polite"
                >0+</span>
                <span className={styles.statLabel}>Experience</span>
              </div>
              <div className={styles.statItem}>
                <span
                  ref={setRef(1)}
                  className={styles.statNumber}
                  aria-live="polite"
                >0+</span>
                <span className={styles.statLabel}>Clients</span>
              </div>
              <div className={styles.statItem}>
                <span
                  ref={setRef(2)}
                  className={styles.statNumber}
                  aria-live="polite"
                >0+</span>
                <span className={styles.statLabel}>Deliveries</span>
              </div>
            </aside>
          </section>

          <figure className={styles.imageWrapper}>
            <Image
              src="/hydel.png" // Replace with your actual image
              alt="Hydel Marketing manufacturing facility"
              width={600}
              height={600}
              className={styles.image}
              priority
            />
          </figure>
        </article>
      </main>
    </>
  );
};

export default AboutUsPage;