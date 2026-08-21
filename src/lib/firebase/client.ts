// src/lib/firebase/client.ts
//
// Firebase CLIENT SDK - used ONLY for Firebase Authentication (admin login +
// authenticator-app MFA enrollment/verification) inside the /admin panel.
// The public website and the rest of the admin panel never talk to Firestore
// from the browser - all data access goes through server API routes using
// the Admin SDK (see src/lib/firebase/admin.ts).
'use client';

import { getApps, initializeApp, FirebaseOptions } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];
  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  const auth = getAuth(getFirebaseApp());
  // Session cookie (server) is the real access-control mechanism; this just
  // keeps the client SDK's own state around for the MFA/login UX.
  setPersistence(auth, browserLocalPersistence).catch(() => {
    /* no-op: persistence failures shouldn't block login */
  });
  return auth;
}
