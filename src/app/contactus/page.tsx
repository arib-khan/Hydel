// app/contactus/page.tsx

import { Metadata } from "next";
import ContactPage from "./ContactForm";
import Script from "next/script";

export const metadata: Metadata = {
  title: 'Contact Us | Hydel Marketing & Services',
  description: 'Get in touch with Hydel Marketing & Services for industrial gaskets and sealing solutions',
  alternates: {
    canonical: 'https://www.hydel.co.in/contactus',
  },
  openGraph: {
    title: 'Contact Us | Hydel Marketing & Services',
    description: 'Reach out for premium industrial sealing solutions and support',
    url: 'https://www.hydel.co.in/contactus',
    images: [
      {
        url: 'https://www.hydel.co.in/hydel.png',
        width: 1200,
        height: 630,
        alt: 'Hydel Marketing & Services Logo',
      },
    ],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Hydel Marketing & Services",
  "description": "Provider of premium industrial gaskets and sealing solutions",
  "image": "https://www.hydel.co.in/hydel.png",
  "url": "https://www.hydel.co.in",
  // Previously a placeholder number ("+91-1234567890") that didn't match the
  // real number shown everywhere else on the site (footer, other schema
  // blocks). Mismatched phone numbers in structured data vs. on-page content
  // is exactly the kind of NAP (Name/Address/Phone) inconsistency that hurts
  // local search relevance.
  "email": "hydel92@gmail.com",
  "address": {
    "@type": "PostalAddress",
    // The previous version had streetAddress: "DRP" (a meaningless
    // placeholder) and postalCode: "400001", which is a Mumbai PIN code, not
    // an Indore one - factually wrong address data is worse than an
    // incomplete one for local SEO. Left both out rather than guessing;
    // fill in the real street address and PIN code once available.
    "addressLocality": "Indore",
    "addressRegion": "Madhya Pradesh",
    "addressCountry": "IN"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  }
};

export default function Contact() {
  return (
    <>
      <Script
        type="application/ld+json"
        id="local-business-structured-data"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ContactPage />
    </>
  );
}