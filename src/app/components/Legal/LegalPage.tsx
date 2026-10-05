// Shared layout for legal pages (keeps the existing Navbar/Footer from PublicChrome).
import type { ReactNode } from 'react';
import { LEGAL_LAST_UPDATED } from '@/lib/legal/config';
import styles from './LegalPage.module.css';

export default function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <article className={styles.article}>
        <header className={styles.header}>
          <h1>{title}</h1>
          <p className={styles.updated}>Last updated: {LEGAL_LAST_UPDATED}</p>
          {intro && <p className={styles.intro}>{intro}</p>}
        </header>
        {children}
      </article>
    </div>
  );
}
