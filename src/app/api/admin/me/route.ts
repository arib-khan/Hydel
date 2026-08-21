// src/app/api/admin/me/route.ts
import { NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { getAdminProfile } from '@/lib/repositories/adminRepository';

export async function GET() {
  try {
    const user = await requireAdminSession();
    const profile = await getAdminProfile(user.uid);
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      role: user.role,
      mfaEnrolled: profile?.mfaEnrolled ?? false,
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}
