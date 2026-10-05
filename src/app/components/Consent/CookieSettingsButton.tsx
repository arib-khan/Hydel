'use client';
import { openConsentPreferences } from '@/lib/consent';
import { ANALYTICS_ENABLED } from '@/lib/legal/config';

/** Footer control to reopen cookie preferences. Renders only when analytics is configured. */
export default function CookieSettingsButton({ className }: { className?: string }) {
  if (!ANALYTICS_ENABLED) return null;
  return (
    <button type="button" className={className} onClick={openConsentPreferences}>
      Cookie Settings
    </button>
  );
}
