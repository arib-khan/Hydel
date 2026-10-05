import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: false },
};

// Rendered inside the root layout, so the public Navbar and Footer stay in place.
export default function NotFound() {
  return (
    <section className={styles.wrap} aria-labelledby="nf-title">
      <p className={styles.code} aria-hidden="true">404</p>
      <h1 id="nf-title" className={styles.title}>Page Not Found</h1>
      <p className={styles.text}>
        Sorry, we couldn&rsquo;t find the page you&rsquo;re looking for. It may have been moved or the link may be incorrect.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>Back to Home</Link>
        <Link href="/products" className={styles.secondary}>View Products</Link>
        <Link href="/contactus" className={styles.secondary}>Contact Us</Link>
      </div>
    </section>
  );
}
