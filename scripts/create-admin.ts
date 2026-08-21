// scripts/create-admin.ts
//
// Creates (or promotes) the very first Super Admin. This is the "manually by
// the owner" mechanism required before anyone can sign into /admin at all -
// there is intentionally no public signup and no in-app way to create the
// first admin, since nobody is authenticated yet to do it from the UI.
//
// After the first Super Admin exists, additional admins should normally be
// created from /admin/users in the app (which calls this same
// createAdminUser logic through an authenticated, superadmin-only API
// route) - but this script also works for any admin, e.g. for
// disaster-recovery if the only Super Admin account is locked out.
//
// Usage:
//   npx tsx scripts/create-admin.ts owner@example.com superadmin
//   npx tsx scripts/create-admin.ts colleague@example.com admin
//
// Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
// in the environment. Prints a one-time temporary password - the admin must
// sign in with it and, per the security requirements, enroll their own
// authenticator app on first login before doing anything else.

import './loadEnv';
import crypto from 'crypto';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

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

function generateTemporaryPassword() {
  return crypto.randomBytes(18).toString('base64url');
}

async function main() {
  const [, , email, roleArg] = process.argv;
  const role = roleArg === 'admin' ? 'admin' : 'superadmin';

  if (!email) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> [admin|superadmin]');
    process.exit(1);
  }

  initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();

  let uid: string;
  const temporaryPassword = generateTemporaryPassword();

  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    await auth.updateUser(uid, { password: temporaryPassword, disabled: false, emailVerified: true });
    console.log(`Found existing Firebase Auth user for ${email}, reset password and set role=${role}.`);
  } catch {
    const created = await auth.createUser({
      email,
      password: temporaryPassword,
      // Firebase requires a verified email before a user can enroll a second
      // factor. These accounts are provisioned directly by a trusted owner/
      // Super Admin (not self-registered), so marking them verified here is
      // safe and is what unblocks MFA enrollment on first login.
      emailVerified: true,
    });
    uid = created.uid;
    console.log(`Created new Firebase Auth user for ${email}.`);
  }

  await auth.setCustomUserClaims(uid, { role });

  await db.collection('adminUsers').doc(uid).set(
    {
      uid,
      email,
      role,
      disabled: false,
      mfaEnrolled: false,
      createdAt: Date.now(),
      createdBy: 'bootstrap-script',
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  console.log('\n✅ Admin ready.');
  console.log(`   Email:              ${email}`);
  console.log(`   Role:               ${role}`);
  console.log(`   Temporary password: ${temporaryPassword}`);
  console.log('\nShare this password securely. On first login, this admin must enroll an');
  console.log('authenticator app at /admin/mfa/enroll before they can access the rest of the panel.');
}

main().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});