// src/app/api/admin/products/[id]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, requireSuperAdmin, UnauthorizedError } from '@/lib/auth/session';
import { restoreProduct } from '@/lib/repositories/productRepository';
import { logAction } from '@/lib/repositories/auditRepository';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    requireSuperAdmin(user);
    const { id } = await params;

    await restoreProduct(id, user.uid);
    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'product.restore',
      entityType: 'product',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to restore product' }, { status: 500 });
  }
}
