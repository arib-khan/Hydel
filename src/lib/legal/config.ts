// src/lib/legal/config.ts
//
// Single source of truth for the facts the legal pages state about Hydel.
// Everything here was taken from the existing codebase (footer, contact
// page, structured data, email templates). Anything that could NOT be
// determined from the project is set to `null` and listed in `OWNER_TODOS`;
// the pages simply omit null values instead of inventing them.

export const SITE_URL = 'https://www.hydel.co.in';

export const LEGAL_LAST_UPDATED = '6 October 2026';
// Bump this whenever the Privacy Policy materially changes. It is stored
// with each enquiry so Hydel can show which version a user agreed to.
export const PRIVACY_POLICY_VERSION = '2026-10-06';

export const BUSINESS = {
  tradeName: 'Hydel Marketing & Services',
  website: 'https://www.hydel.co.in',
  email: 'info@hydel.co.in',
  locality: 'Indore, Madhya Pradesh, India',
  workingHours: 'Monday to Saturday, 9:00 AM to 6:00 PM',
  // ---- NOT FOUND in the project: supplied by the owner before go-live ----
  legalEntityName: null as string | null, // e.g. proprietorship / partnership / company name
  registeredAddress: null as string | null, // street address + PIN code
  gstin: null as string | null,
  cin: null as string | null,
} as const;

/** Google Analytics Measurement ID. Analytics is OFF unless this is set. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
export const ANALYTICS_ENABLED = /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID);

export const OWNER_TODOS = [
  'Confirm the legal entity type/name (proprietorship, partnership, company) and add it to BUSINESS.legalEntityName.',
  'Add the registered/office street address and PIN code (BUSINESS.registeredAddress). Only "Indore, Madhya Pradesh" exists in the project.',
  'Add GSTIN / CIN only if you want them published on the website.',
  'Decide and confirm the data-retention period for enquiries (currently described without a fixed period).',
  'Confirm governing law / jurisdiction wording (Terms: laws of India, courts at Indore) with a lawyer.',
  'Decide whether to publish the sales phone number; it is currently only used in the WhatsApp link and confirmation email.',
  'If you enable Google Analytics, set NEXT_PUBLIC_GA_MEASUREMENT_ID (the repo contained an unused GA component and no Measurement ID).',
  'Check whether Cloudflare (the live site is served through it) is configured with analytics/bot features that set cookies.',
];
