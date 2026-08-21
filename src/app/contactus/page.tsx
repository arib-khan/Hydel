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
  "image": "https://www.hydel.co.in/Hydel_Logo.png",
  "url": "https://www.hydel.co.in",
  "telephone": "+91-1234567890",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "DRP",
    "addressLocality": "Indore",
    "postalCode": "400001",
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
