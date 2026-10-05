// src/app/components/Consent/CookieBanner.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OPEN_PREFERENCES_EVENT, readConsent, writeConsent } from '@/lib/consent';
import { ANALYTICS_ENABLED } from '@/lib/legal/config';
import styles from './CookieBanner.module.css';

/**
 * Analytics consent UI. Rendered ONLY when Google Analytics is actually
 * configured (NEXT_PUBLIC_GA_MEASUREMENT_ID). Hydel's other storage is
 * strictly necessary, so no banner is needed when analytics is off.
 * Accept and Reject have equal prominence; nothing is pre-selected.
 */
export default function CookieBanner() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false); // unchecked by default
  const prefsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(true);
    setShowBanner(readConsent() === null);
    const open = () => {
      setAnalyticsChoice(readConsent()?.analytics ?? false);
      setShowPrefs(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
  }, []);

  const decide = useCallback((analytics: boolean) => {
    writeConsent(analytics);
    setShowBanner(false);
    setShowPrefs(false);
  }, []);

  useEffect(() => {
    if (!showPrefs) return;
    prefsRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowPrefs(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPrefs]);

  if (!ANALYTICS_ENABLED || !ready || pathname?.startsWith('/admin')) return null;

  return (
    <>
      {showBanner && !showPrefs && (
        <section className={styles.banner} role="region" aria-label="Cookie consent">
          <div className={styles.text}>
            <p className={styles.title}>Cookies &amp; analytics</p>
            <p>
              We use Google Analytics cookies and similar technologies to understand how visitors use
              our website. They are only set if you accept. You can browse the site normally without them.
              See our <Link href="/cookie-policy">Cookie Policy</Link> and{' '}
              <Link href="/privacy-policy">Privacy Policy</Link>.
            </p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={() => decide(false)}>Reject</button>
            <button type="button" className={styles.btn} onClick={() => setShowPrefs(true)}>Manage</button>
            <button type="button" className={styles.btn} onClick={() => decide(true)}>Accept</button>
          </div>
        </section>
      )}

      {showPrefs && (
        <div className={styles.overlay} onClick={() => setShowPrefs(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
            tabIndex={-1}
            ref={prefsRef}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cookie-prefs-title">Cookie preferences</h2>
            <div className={styles.row}>
              <div>
                <strong>Strictly necessary</strong>
                <p>Needed for the website to work (for example, secure sign-in for site administrators). Always on.</p>
              </div>
              <span className={styles.always}>Always on</span>
            </div>
            <div className={styles.row}>
              <div>
                <strong>Analytics (Google Analytics)</strong>
                <p>Helps us understand which pages are used so we can improve the site. Off unless you turn it on.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={analyticsChoice}
                  onChange={(e) => setAnalyticsChoice(e.target.checked)}
                />
                <span className={styles.srOnly}>Allow analytics cookies</span>
              </label>
            </div>
            <p className={styles.links}>
              <Link href="/cookie-policy">Cookie Policy</Link> · <Link href="/privacy-policy">Privacy Policy</Link>
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={() => setShowPrefs(false)}>Cancel</button>
              <button type="button" className={styles.btn} onClick={() => decide(analyticsChoice)}>Save preferences</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
