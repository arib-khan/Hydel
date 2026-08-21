// src/app/api/admin/users/route.ts
// Super Admin only: list admins and provision new admin accounts.
// New admins are created with a random temporary password and NO MFA
// enrolled - they must sign in once and immediately enroll their own
// authenticator app (see /admin/mfa/enroll). This is the in-app equivalent
// of "admins created manually by the owner/super administrator".
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAdminSession, requireSuperAdmin, UnauthorizedError } from '@/lib/auth/session';
import { listAdminProfiles, createAdminUser } from '@/lib/repositories/adminRepository';
import { logAction } from '@/lib/repositories/auditRepository';
import { z } from 'zod';

const createAdminSchema = z.object({
  email: z.string().email(),
  displayName: z.string().trim().min(1).optional(),
  role: z.enum(['admin', 'superadmin']),
});

function generateTemporaryPassword() {
  return crypto.randomBytes(18).toString('base64url');
}

export async function GET() {
  try {
    const user = await requireAdminSession();
    requireSuperAdmin(user);
    const admins = await listAdminProfiles();
    return NextResponse.json({ admins });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to load admins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminSession();
    requireSuperAdmin(user);

    const body = await request.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid admin data', details: parsed.error.flatten() }, { status: 400 });
    }

    const temporaryPassword = generateTemporaryPassword();
    const admin = await createAdminUser({
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      role: parsed.data.role,
      temporaryPassword,
      createdBy: user.uid,
    });

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'admin.create',
      entityType: 'admin',
      entityId: admin.uid,
      metadata: { email: admin.email, role: admin.role },
    });

    // The temporary password is returned ONCE so the Super Admin can share it
    // securely (e.g. read aloud, password manager) with the new admin. It is
    // never stored anywhere and never logged.
    return NextResponse.json({ admin, temporaryPassword }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin users] create failed', err);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
