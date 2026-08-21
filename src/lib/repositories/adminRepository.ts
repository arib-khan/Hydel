// src/lib/repositories/adminRepository.ts
import 'server-only';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import type { AdminUser, AdminRole } from '@/types/admin';

const COLLECTION = 'adminUsers';

/**
 * adminUsers/{uid} is a denormalized profile document kept in sync with the
 * Firebase Auth user + custom claims, so admin list/search UI doesn't need
 * to call the Auth Admin API for every render. Firebase Auth + custom claims
 * remain the actual source of truth for authorization decisions.
 */
export async function upsertAdminProfile(profile: AdminUser): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(profile.uid).set(profile, { merge: true });
}

export async function listAdminProfiles(): Promise<AdminUser[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs.map((d) => d.data() as AdminUser);
}

export async function getAdminProfile(uid: string): Promise<AdminUser | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as AdminUser;
}

/** Creates a brand-new Firebase Auth admin user, sets their role custom claim, and stores the profile doc. */
export async function createAdminUser(params: {
  email: string;
  temporaryPassword: string;
  role: AdminRole;
  displayName?: string;
  createdBy: string;
}): Promise<AdminUser> {
  const auth = getAdminAuth();
  const userRecord = await auth.createUser({
    email: params.email,
    password: params.temporaryPassword,
    displayName: params.displayName,
    // See the identical note in scripts/create-admin.ts: MFA enrollment
    // requires a verified email, and only a Super Admin can reach this
    // function, so it's safe to mark these accounts verified up front.
    emailVerified: true,
  });

  await auth.setCustomUserClaims(userRecord.uid, { role: params.role });

  const profile: AdminUser = {
    uid: userRecord.uid,
    email: params.email,
    displayName: params.displayName,
    role: params.role,
    disabled: false,
    mfaEnrolled: false,
    createdAt: Date.now(),
    createdBy: params.createdBy,
    updatedAt: Date.now(),
  };

  await upsertAdminProfile(profile);
  return profile;
}

export async function setAdminRole(uid: string, role: AdminRole): Promise<void> {
  const auth = getAdminAuth();
  const user = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { ...(user.customClaims || {}), role });
  await upsertAdminProfile({ ...(await getAdminProfile(uid))!, role, updatedAt: Date.now() });
}

export async function setAdminDisabled(uid: string, disabled: boolean): Promise<void> {
  const auth = getAdminAuth();
  await auth.updateUser(uid, { disabled });
  const existing = await getAdminProfile(uid);
  if (existing) {
    await upsertAdminProfile({ ...existing, disabled, updatedAt: Date.now() });
  }
}

/** Refreshes the denormalized mfaEnrolled flag from Firebase Auth's actual enrolled-factors list. */
export async function syncMfaStatus(uid: string): Promise<boolean> {
  const auth = getAdminAuth();
  const user = await auth.getUser(uid);
  const enrolled = (user.multiFactor?.enrolledFactors?.length ?? 0) > 0;
  const existing = await getAdminProfile(uid);
  if (existing) {
    await upsertAdminProfile({ ...existing, mfaEnrolled: enrolled, updatedAt: Date.now() });
  }
  return enrolled;
}
