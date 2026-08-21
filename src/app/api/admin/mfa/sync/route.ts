// src/app/api/admin/mfa/sync/route.ts
// Called by the client right after a successful TOTP enrollment so the
// denormalized adminUsers/{uid}.mfaEnrolled flag reflects reality.
import { NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { syncMfaStatus } from '@/lib/repositories/adminRepository';

export async function POST() {
  try {
    const user = await requireAdminSession();
    const mfaEnrolled = await syncMfaStatus(user.uid);
    return NextResponse.json({ mfaEnrolled });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to sync MFA status' }, { status: 500 });
  }
}
