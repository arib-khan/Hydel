import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../components/Legal/LegalPage';
import styles from '../components/Legal/LegalPage.module.css';
import CookieSettingsButton from '../components/Consent/CookieSettingsButton';
import { ANALYTICS_ENABLED, BUSINESS, SITE_URL } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Which cookies and similar technologies the Hydel Marketing & Services website uses, and how to manage your choices.',
  alternates: { canonical: `${SITE_URL}/cookie-policy` },
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" intro={`This policy explains how ${BUSINESS.tradeName} uses cookies and similar technologies on ${BUSINESS.website}.`}>
      <h2>1. What are cookies?</h2>
      <p>Cookies are small text files stored on your device by a website. Similar technologies (such as local storage or tracking identifiers) work in comparable ways. Some are essential for a site to work; others, like analytics, are optional.</p>

      <h2>2. What this website uses</h2>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Name / technology</th><th>Provider</th><th>Purpose</th><th>Type</th><th>Duration</th></tr></thead>
          <tbody>
            <tr><td><code>hydel_admin_session</code> cookie</td><td>Hydel</td><td>Keeps administrators signed in to the admin area. Never set for ordinary visitors.</td><td>Strictly necessary</td><td>Up to 5 days</td></tr>
            <tr><td>Firebase Authentication data (browser local storage)</td><td>Google Firebase</td><td>Admin sign-in and multi-factor authentication. Only used in the admin area.</td><td>Strictly necessary</td><td>Until sign-out / cleared</td></tr>
            {ANALYTICS_ENABLED && (
              <tr><td><code>hydel_consent</code> (local storage)</td><td>Hydel</td><td>Remembers your cookie choice so we do not ask again.</td><td>Strictly necessary</td><td>Until you clear browser data</td></tr>
            )}
            {ANALYTICS_ENABLED && (
              <tr><td><code>_ga</code>, <code>_ga_*</code></td><td>Google Analytics</td><td>Distinguish visitors and sessions to produce usage statistics.</td><td>Analytics (optional)</td><td>Up to 2 years (Google default)</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p><strong>Google Maps:</strong> the Contact Us page embeds a Google Map. When that page loads, your browser connects to Google, which may set its own cookies or read identifiers according to Google&rsquo;s policies. We do not control these. If you prefer, avoid the Contact Us page and email us instead.</p>
      <p><strong>Cloudinary / Cloudflare:</strong> images and media are loaded from Cloudinary, and the site may be delivered through Cloudflare. These providers may use technical or security cookies. {/* TODO(owner): verify with browser dev tools on the live site which cookies Cloudflare sets. */}</p>
      <p><strong>Firebase:</strong> using Firebase does not by itself set cookies on visitors. Hydel uses Firebase Firestore (server-side) and Firebase Authentication (admin area only).</p>

      <h2>3. Google Analytics</h2>
      {ANALYTICS_ENABLED ? (
        <>
          <p>We use Google Analytics 4 to understand how visitors use the site (pages viewed, approximate location, device and browser type, how visitors arrive) so we can improve content and products. It is <strong>off by default</strong>: nothing is sent to Google Analytics and no analytics cookies are set unless you click &ldquo;Accept&rdquo; (or enable Analytics under &ldquo;Manage&rdquo;). We use Google Consent Mode and keep advertising storage and personalisation permanently denied.</p>
          <p>Google acts as a service provider; Google&rsquo;s own use of data is described in its privacy policy.</p>
        </>
      ) : (
        <p>Google Analytics is <strong>not currently active</strong> on this website. If we turn it on, it will run only after you opt in, and this page will be updated.</p>
      )}

      <h2>4. Advertising and remarketing</h2>
      <p>This website does not use Google Ads, remarketing, Google Signals or advertising cookies.</p>

      <h2>5. Managing or withdrawing consent</h2>
      {ANALYTICS_ENABLED && (
        <p>You can change your choice at any time using the &ldquo;Cookie Settings&rdquo; link in the footer, or here: <CookieSettingsButton className={styles.inlineButton} />. Turning analytics off stops further tracking and removes Google Analytics cookies set by this site.</p>
      )}
      <p>You can also block or delete cookies in your browser settings; see your browser&rsquo;s help pages. Blocking strictly necessary storage may stop administrators from signing in; ordinary browsing of the website and sending enquiries do not depend on cookies.</p>

      <h2>6. More information</h2>
      <p>See our <Link href="/privacy-policy">Privacy Policy</Link> or email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p>
    </LegalPage>
  );
}
