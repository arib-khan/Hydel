import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../components/Legal/LegalPage';
import { BUSINESS, SITE_URL } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Important information about the product specifications and technical information on the Hydel Marketing & Services website.',
  alternates: { canonical: `${SITE_URL}/disclaimer` },
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" intro="Please read this before relying on any information on this website.">
      <h2>General information only</h2>
      <p>The product descriptions, materials, specifications, temperature/pressure ranges, standards, applications and images on this website are provided as general information to help you understand our range. They are not a guarantee of performance, suitability or fitness for any particular purpose.</p>

      <h2>Verify before you buy or use</h2>
      <p>Sealing performance depends on operating conditions such as media, temperature, pressure, flange condition, installation and maintenance. Values shown are indicative and may vary between batches or change without notice. Before selecting or using any product, confirm the exact specification with us in writing, and test it in your application where appropriate. Images are illustrative and actual products may differ.</p>

      <h2>Not professional advice</h2>
      <p>Nothing on this website is professional engineering, safety, legal, medical, financial or other professional advice. For safety-critical, high-pressure, hazardous-media or regulated applications, consult a qualified engineer and follow applicable standards, regulations and your site&rsquo;s procedures.</p>

      <h2>Materials and handling</h2>
      <p>Some industrial sealing materials require special handling and compliance with applicable regulations. It is your responsibility to ensure that the products you choose and how you use them comply with the laws and safety requirements that apply to you.</p>

      <h2>Third-party names and links</h2>
      <p>Client names, logos and trademarks are the property of their owners, and their display does not imply endorsement. We are not responsible for the content of external websites or services linked from this site.</p>

      <h2>Limitation</h2>
      <p>To the extent permitted by law, {BUSINESS.tradeName} is not responsible for loss arising from reliance on information on this website. See also our <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>.</p>

      <h2>Questions</h2>
      <p>For accurate specifications or technical clarification, email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or use our <Link href="/contactus">contact form</Link>.</p>
    </LegalPage>
  );
}
