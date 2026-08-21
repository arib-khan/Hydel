// scripts/enable-totp-mfa.ts
//
// Enables TOTP (authenticator app) multi-factor auth for the whole Firebase
// project. Unlike SMS-based MFA, there is no Firebase Console toggle for
// this - it can only be turned on via the Admin SDK or the Identity
// Platform REST API, which is what this script does. This is a one-time,
// per-project setup step - run it once before anyone tries to enroll at
// /admin/mfa/enroll.
//
// Usage:
//   npx tsx scripts/enable-totp-mfa.ts
//
// Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
// in the environment, and requires your project to already be upgraded to
// Firebase Authentication with Identity Platform (Firebase Console →
// Authentication → you'll see an "Upgrade to Identity Platform" prompt if
// this hasn't happened yet - upgrading is free and does not change existing
// users or sign-in methods).

import './loadEnv';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function initFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials in the environment.');
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  }
}

async function main() {
  initFirebaseAdmin();
  const auth = getAuth();

  await auth.projectConfigManager().updateProjectConfig({
    multiFactorConfig: {
      state: 'ENABLED',
      providerConfigs: [
        {
          state: 'ENABLED',
          totpProviderConfig: {
            adjacentIntervals: 5, // Firebase's default: accepts codes from ±5 x 30s windows to tolerate clock drift.
          },
        },
      ],
    },
  });

  console.log('✅ TOTP multi-factor authentication is now enabled for this Firebase project.');
  console.log('   Admins can now enroll an authenticator app at /admin/mfa/enroll.');
}

main().catch((err) => {
  console.error('Failed to enable TOTP MFA:', err);
  console.error(
    '\nIf this fails with a permissions or "not found" style error, your project likely still needs to be ' +
    'upgraded to Firebase Authentication with Identity Platform first - Firebase Console → Authentication, ' +
    'look for an "Upgrade" prompt.'
  );
  process.exit(1);
});