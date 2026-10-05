// src/lib/consent.ts
// Client-side helpers for the analytics consent choice. Only a boolean
// choice + timestamp + version is stored, in localStorage on this device.
export const CONSENT_STORAGE_KEY = 'hydel_consent';
export const CONSENT_VERSION = 1;
export const CONSENT_CHANGED_EVENT = 'hydel:consent-changed';
export const OPEN_PREFERENCES_EVENT = 'hydel:open-consent';

export interface ConsentRecord {
  analytics: boolean;
  timestamp: number;
  version: number;
}

export function readConsent(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (typeof parsed.analytics !== 'boolean' || parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): ConsentRecord {
  const record: ConsentRecord = { analytics, timestamp: Date.now(), version: CONSENT_VERSION };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable: choice applies for this page view only */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: record }));
  return record;
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
