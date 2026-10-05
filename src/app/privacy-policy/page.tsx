import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../components/Legal/LegalPage';
import HydelContact from '../components/Legal/HydelContact';
import { ANALYTICS_ENABLED, BUSINESS, SITE_URL } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Hydel Marketing & Services collects, uses, stores and protects personal information submitted through its website enquiry forms.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This Privacy Policy explains how ${BUSINESS.tradeName} ("Hydel", "we", "us") handles personal information when you use ${BUSINESS.website}.`}
    >
      <h2>1. Who we are</h2>
      <HydelContact />
      {/* TODO(owner): add legal entity name, registered address (see src/lib/legal/config.ts). */}

      <h2>2. Information we collect</h2>
      <h3>a) Product enquiry form (&ldquo;Inquire About This Product&rdquo;)</h3>
      <p>When you send an enquiry about a product we collect: your name, email address, phone number, company name (optional), the product you are asking about, quantity (optional), your message, and any additional requirements (optional). We also record the date and time of your enquiry, the version of this Privacy Policy and the time you agreed to it.</p>
      <p>For abuse prevention we also record your IP address and browser/device information (the &ldquo;user agent&rdquo; sent by your browser) with the enquiry.</p>
      <h3>b) Contact form (Contact Us page)</h3>
      <p>The Contact Us form collects your name, email address and message. These are emailed to our business mailbox, and an automatic acknowledgement is emailed to the address you provide. This form does not currently save your submission in our database.</p>
      <h3>c) Contacting us by email or WhatsApp</h3>
      <p>The site has a WhatsApp &ldquo;Enquiry&rdquo; button and email links. If you use them, your messages, phone number and any details you share are handled by us and by the messaging or email provider you use. Clicking the WhatsApp button opens WhatsApp (a service of Meta) in a new tab; Hydel does not receive any information until you choose to send a message.</p>
      <h3>d) Technical and analytics data</h3>
      <p>Hydel&rsquo;s own site code does not set advertising or tracking cookies on public visitors. {ANALYTICS_ENABLED
        ? 'If you choose to accept analytics, Google Analytics collects usage data as described in our Cookie Policy.'
        : 'Google Analytics is not currently active on this website. If it is enabled in future, it will only run after you give consent, and this policy and our Cookie Policy will be updated.'} Our hosting and network providers may keep standard technical server logs (such as IP address and requested pages) to operate and secure the website.</p>

      <h2>3. Why we use your information</h2>
      <ul>
        <li>to respond to your enquiry, provide quotations and information about our products and services;</li>
        <li>to keep records of enquiries and follow up on them (our staff can add internal notes and update the status of an enquiry);</li>
        <li>to protect the website against spam and misuse (rate limiting, IP and user-agent records);</li>
        <li>to comply with legal obligations and to establish or defend legal claims.</li>
      </ul>
      <p>We rely on your consent (given by ticking the Privacy Policy box on our forms) and, where permitted, on our legitimate interest in responding to business enquiries. We do not sell your personal information and do not use enquiry details for unrelated marketing without asking you.</p>

      <h2>4. Where and how your information is stored</h2>
      <p>Product enquiries are stored in <strong>Google Cloud Firestore</strong> (part of Firebase / Google Cloud), accessed only through our own server. Authorised Hydel administrators view enquiries in a password- and multi-factor-protected admin area, which uses <strong>Firebase Authentication</strong>. Notification emails and Contact Us messages are sent from a Gmail account using SMTP. Product images and carousel media are served from Cloudinary.</p>
      <p>These providers may process data on servers outside India, depending on the region in which the services are configured. {/* TODO(owner): confirm Firestore region. */}</p>
      <p>We do not currently use Firebase Storage, Firebase Analytics or Firebase Hosting for this website.</p>

      <h2>5. Cookies and similar technologies</h2>
      <p>Details are in our <Link href="/cookie-policy">Cookie Policy</Link>. In summary, the only cookie set by the site itself is a secure sign-in session cookie used by administrators; it is not set for ordinary visitors.</p>

      <h2>6. Third-party services</h2>
      <ul>
        <li><strong>Google (Firebase/Google Cloud, Gmail, Google Maps):</strong> data storage, email delivery, and the map shown on the Contact page. Loading the map contacts Google and may set Google cookies; see the Cookie Policy.</li>
        <li><strong>Cloudinary:</strong> hosts product and carousel images/videos; your browser requests them directly, so Cloudinary can see your IP address.</li>
        <li><strong>WhatsApp (Meta):</strong> only if you choose to message us.</li>
        {ANALYTICS_ENABLED && <li><strong>Google Analytics:</strong> only if you accept analytics cookies.</li>}
        <li><strong>Hosting / CDN providers:</strong> deliver the website. {/* TODO(owner): name hosting provider. */}</li>
      </ul>
      <p>These providers have their own privacy policies. We share your information only with service providers that help us operate the website and handle enquiries, with professional advisers where needed, or where required by law.</p>

      <h2>7. Retention</h2>
      <p>We keep enquiry information for as long as needed to respond, follow up on the enquiry and keep ordinary business records, and then delete or anonymise it unless we must keep it for legal reasons. {/* TODO(owner): state a fixed retention period if desired. */}</p>

      <h2>8. Security</h2>
      <p>Enquiry data is written to the database only through our server; direct browser access to the database is blocked. Administrator access requires sign-in with multi-factor authentication, and the site limits repeated submissions to reduce abuse. No online system is completely secure, so we cannot guarantee absolute security.</p>

      <h2>9. Your rights and choices</h2>
      <p>Subject to applicable law (including India&rsquo;s Digital Personal Data Protection Act, 2023, to the extent it applies), you may ask us to: tell you what personal information we hold about you; correct inaccurate information; delete your information; or withdraw your consent. You may also ask any privacy-related question or raise a complaint.</p>
      <p>To make a request, email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> from the address you used in your enquiry, with the subject &ldquo;Privacy Request&rdquo;. We may need to verify your identity, and will respond within a reasonable time. Withdrawing consent does not affect processing done before withdrawal.</p>

      <h2>10. Children</h2>
      <p>Our website and products are intended for businesses and adults. We do not knowingly collect personal information from children under 18. If you believe a child has sent us information, contact us and we will delete it.</p>

      <h2>11. Changes to this policy</h2>
      <p>We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above shows the latest revision.</p>

      <h2>12. Contact</h2>
      <p>Questions or requests about this policy: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p>
    </LegalPage>
  );
}
