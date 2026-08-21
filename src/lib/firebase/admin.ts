// src/lib/firebase/admin.ts
//
// Firebase Admin SDK - SERVER ONLY. Never import this file from a file that
// can end up in a client bundle ('use client' components, etc). Every
// consumer of Firestore/Auth in this app goes through here so that:
//   - Firestore security rules can stay deny-all (defense in depth), because
//     the browser never talks to Firestore directly.
//   - Secrets (service account key) never reach the client bundle.
import 'server-only';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private keys are usually stored in env vars with literal \n sequences.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
        'and FIREBASE_PRIVATE_KEY (see .env.example).'
    );
  }

  return { projectId, clientEmail, privateKey };
}

let app: App;
let firestoreConfigured = false;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  const serviceAccount = loadServiceAccount();
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
  return app;
}

export function getAdminDb(): Firestore {
  const db = getFirestore(getAdminApp());
  // Several optional Product/AdminUser/Inquiry fields (displayName,
  // fullDescription, price, etc.) are legitimately `undefined` rather than
  // omitted from the object - e.g. an admin created without a display name,
  // or a product update payload that only changes some fields. The Admin
  // SDK rejects `undefined` values by default, so this is set once, here,
  // rather than manually stripping undefined keys before every write.
  //
  // The `firestoreConfigured` flag is a best-effort fast path only. In
  // Next.js dev mode, hot-reloading re-evaluates this module (resetting the
  // flag to false) while the underlying Firestore client tied to the
  // Firebase App singleton persists across reloads and remembers it was
  // already configured - calling settings() again on it throws. There's no
  // reliable way to detect "already configured" ahead of time, so the fix is
  // simply to ignore that specific error rather than let it fail the
  // request.
  if (!firestoreConfigured) {
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('already been initialized')) {
        throw err;
      }
    }
    firestoreConfigured = true;
  }
  return db;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
