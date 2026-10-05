// src/app/components/GoogleAnalytics.tsx
//
// Consent-gated Google Analytics 4 (gtag.js) loader using Google Consent Mode v2.
//
// Design ("basic" consent mode): NOTHING is requested from Google until the
// visitor has explicitly granted analytics. gtag.js is not loaded, no _ga
// cookies are set, and no hit is sent beforehand. When consent is granted
// the consent default (all denied) is declared, immediately updated to
// analytics_storage=granted, and only then is the script loaded. Advertising
// signals (ad_storage, ad_user_data, ad_personalization) are ALWAYS denied:
// Hydel does not use Google Ads/remarketing.
//
// Withdrawing consent updates Consent Mode to denied, sets the GA
// opt-out flag, and deletes the _ga* cookies for this site.
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_CHANGED_EVENT, readConsent } from '@/lib/consent';
import { ANALYTICS_ENABLED, GA_MEASUREMENT_ID } from '@/lib/legal/config';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

function deleteGaCookies() {
  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((n) => n === '_ga' || n.startsWith('_ga_') || n === '_gid' || n.startsWith('_gat'));
  const host = window.location.hostname;
  const parts = host.split('.');
  const domains = new Set<string>([host, `.${host}`]);
  for (let i = 1; i < parts.length - 1; i++) domains.add(`.${parts.slice(i).join('.')}`);
  names.forEach((name) => {
    domains.forEach((d) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
    });
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const loaded = useRef(false);
  const granted = useRef(false);

  const sendPageView = useCallback(() => {
    if (!granted.current || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, []);

  const grant = useCallback(() => {
    granted.current = true;
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
      };
    }
    if (!loaded.current) {
      loaded.current = true;
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false, // page views are sent manually (SPA navigation)
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
      document.head.appendChild(s);
    } else {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    sendPageView();
  }, [sendPageView]);

  const revoke = useCallback(() => {
    granted.current = false;
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    deleteGaCookies();
  }, []);

  // Apply stored choice on load and react to later changes.
  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;
    const apply = () => (readConsent()?.analytics ? grant() : revoke());
    const existing = readConsent();
    if (existing?.analytics) grant();
    window.addEventListener(CONSENT_CHANGED_EVENT, apply);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, apply);
  }, [grant, revoke]);

  // Page view on client-side navigation (the first one is sent by grant()).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sendPageView();
  }, [pathname, sendPageView]);

  return null;
}
