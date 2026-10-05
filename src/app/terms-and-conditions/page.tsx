import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../components/Legal/LegalPage';
import HydelContact from '../components/Legal/HydelContact';
import { BUSINESS, SITE_URL } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms governing use of the Hydel Marketing & Services website.',
  alternates: { canonical: `${SITE_URL}/terms-and-conditions` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" intro={`By using ${BUSINESS.website} you agree to these terms. If you do not agree, please do not use the website.`}>
      <h2>1. About this website</h2>
      <p>This website presents the industrial gaskets, seals and related products of {BUSINESS.tradeName} and lets you send us enquiries. It does not currently offer online ordering or online payment; any purchase is agreed separately with us.</p>

      <h2>2. Use of the website</h2>
      <p>You may use the website for lawful purposes only and in a way that does not harm its operation or other users.</p>

      <h2>3. Prohibited activities</h2>
      <ul>
        <li>submitting false, misleading or another person&rsquo;s information in our forms;</li>
        <li>sending spam, automated or bulk submissions, or attempting to overload the site;</li>
        <li>attempting to gain unauthorised access to the website, admin area or its data, or to introduce malicious code;</li>
        <li>scraping or copying the website&rsquo;s content in bulk without our written permission.</li>
      </ul>

      <h2>4. Product and service information</h2>
      <p>Product descriptions, specifications, images and applications are provided for general information and may change without notice. See our <Link href="/disclaimer">Disclaimer</Link>. A quotation or order is binding only when confirmed by us in writing.</p>

      <h2>5. Accuracy of information you provide</h2>
      <p>You are responsible for the accuracy of the details you give us, including product requirements and contact information, and for deciding whether a product suits your application.</p>

      <h2>6. Intellectual property</h2>
      <p>The website&rsquo;s text, logos, product images, design and other content belong to Hydel or its licensors, or are used with permission. Client and brand names and logos shown belong to their respective owners and are shown for identification only. You may not reproduce or reuse them without permission, except for normal viewing and sharing of links.</p>

      <h2>7. External links and third-party services</h2>
      <p>The website links to or embeds third-party services (for example WhatsApp and Google Maps). We do not control and are not responsible for their content or practices.</p>

      <h2>8. Availability</h2>
      <p>We try to keep the website available but do not guarantee uninterrupted or error-free access. We may suspend or change it for maintenance or other reasons.</p>

      <h2>9. Limitation of liability</h2>
      <p>To the fullest extent permitted by law, Hydel is not liable for indirect or consequential loss arising from use of, or inability to use, the website or reliance on its content. Nothing in these terms limits liability that cannot be limited under applicable law. Terms of any actual sale will be as set out in our written quotation or order confirmation.</p>

      <h2>10. Changes</h2>
      <p>We may change the website, its products information and these terms at any time. Updated terms apply from the &ldquo;Last updated&rdquo; date shown above.</p>

      <h2>11. Governing law</h2>
      <p>These terms are governed by the laws of India, and the courts at Indore, Madhya Pradesh will have jurisdiction, subject to applicable law. {/* TODO(owner/lawyer): confirm governing-law and jurisdiction wording. */}</p>

      <h2>12. Contact</h2>
      <HydelContact />
      <p>See also our <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/cookie-policy">Cookie Policy</Link>.</p>
    </LegalPage>
  );
}
