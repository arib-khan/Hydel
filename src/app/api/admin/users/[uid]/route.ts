// src/app/api/admin/users/[uid]/route.ts
// Super Admin only: change an admin's role or enabled/disabled status.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminSession, requireSuperAdmin, UnauthorizedError } from '@/lib/auth/session';
import { setAdminRole, setAdminDisabled } from '@/lib/repositories/adminRepository';
import { logAction } from '@/lib/repositories/auditRepository';

const patchSchema = z.object({
  role: z.enum(['admin', 'superadmin']).optional(),
  disabled: z.boolean().optional(),
});

interface Params {
  params: Promise<{ uid: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    requireSuperAdmin(user);
    const { uid } = await params;

    if (uid === user.uid) {
      return NextResponse.json({ error: 'You cannot change your own role or status.' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (parsed.data.role) {
      await setAdminRole(uid, parsed.data.role);
      await logAction({
        actorUid: user.uid,
        actorEmail: user.email,
        action: 'admin.role_change',
        entityType: 'admin',
        entityId: uid,
        metadata: { role: parsed.data.role },
      });
    }

    if (typeof parsed.data.disabled === 'boolean') {
      await setAdminDisabled(uid, parsed.data.disabled);
      await logAction({
        actorUid: user.uid,
        actorEmail: user.email,
        action: parsed.data.disabled ? 'admin.disabled' : 'admin.enabled',
        entityType: 'admin',
        entityId: uid,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin users] update failed', err);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}
