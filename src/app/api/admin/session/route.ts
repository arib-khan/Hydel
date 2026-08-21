// src/app/api/admin/session/route.ts
//
// Exchanges a freshly-signed-in Firebase ID token (obtained client-side after
// email/password + MFA) for a secure, httpOnly session cookie. This is the
// only place a role claim is trusted from a token rather than re-derived.
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from '@/lib/auth/session';
import { getAdminProfile, syncMfaStatus, upsertAdminProfile } from '@/lib/repositories/adminRepository';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);

    const role = decoded.role as string | undefined;
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json(
        { error: 'This account is not authorized for admin access.' },
        { status: 403 }
      );
    }

    const userRecord = await auth.getUser(decoded.uid);
    if (userRecord.disabled) {
      return NextResponse.json({ error: 'This admin account has been disabled.' }, { status: 403 });
    }

    const mfaEnrolled = (userRecord.multiFactor?.enrolledFactors?.length ?? 0) > 0;

    // Keep the denormalized adminUsers/{uid} profile doc in sync.
    const existingProfile = await getAdminProfile(decoded.uid);
    await upsertAdminProfile({
      uid: decoded.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName,
      role: role as 'admin' | 'superadmin',
      disabled: false,
      mfaEnrolled,
      createdAt: existingProfile?.createdAt ?? Date.now(),
      createdBy: existingProfile?.createdBy,
      updatedAt: Date.now(),
    });

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });

    const response = NextResponse.json({ role, mfaEnrolled });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
    return response;
  } catch (err) {
    console.error('[admin session] failed to create session', err);
    return NextResponse.json({ error: 'Could not sign in. Please try again.' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
