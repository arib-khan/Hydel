// src/lib/auth/session.ts
//
// Server-side session handling built on Firebase Admin session cookies.
// This is the ONLY thing that decides whether a request is an authenticated
// admin/superadmin - never trust a role/claim value that came from the
// client (body, query string, localStorage, etc).
import 'server-only';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';
import type { AdminRole } from '@/types/admin';

export const SESSION_COOKIE_NAME = 'hydel_admin_session';
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export interface AdminSessionUser {
  uid: string;
  email: string;
  role: AdminRole;
}

export class UnauthorizedError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Verifies the session cookie against Firebase Admin, confirms the user has
 * a valid admin/superadmin custom claim, and returns the authenticated user.
 * Throws UnauthorizedError otherwise. This is what every protected admin API
 * route and server component should call.
 */
export async function requireAdminSession(): Promise<AdminSessionUser> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    throw new UnauthorizedError('Not signed in.');
  }

  const auth = getAdminAuth();
  let decoded;
  try {
    decoded = await auth.verifySessionCookie(sessionCookie, true /* checkRevoked */);
  } catch {
    throw new UnauthorizedError('Session expired or invalid. Please sign in again.');
  }

  const role = decoded.role as AdminRole | undefined;
  if (role !== 'admin' && role !== 'superadmin') {
    throw new UnauthorizedError('This account is not authorized for admin access.', 403);
  }

  // Re-check the live user record so a disabled account is rejected even if
  // an old session cookie is still technically valid.
  const userRecord = await auth.getUser(decoded.uid);
  if (userRecord.disabled) {
    throw new UnauthorizedError('This admin account has been disabled.', 403);
  }

  return { uid: decoded.uid, email: decoded.email || '', role };
}

export function requireSuperAdmin(user: AdminSessionUser) {
  if (user.role !== 'superadmin') {
    throw new UnauthorizedError('Super Admin access required for this action.', 403);
  }
}
