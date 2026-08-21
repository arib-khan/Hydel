// src/app/api/admin/products/reorder/route.ts
//
// Persists a new storefront display order for products. Because this is a
// STATIC segment ("reorder"), Next.js matches it ahead of the sibling dynamic
// [id] route, so POST /api/admin/products/reorder never collides with the
// per-product handlers.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { reorderProducts } from '@/lib/repositories/productRepository';
import { logAction } from '@/lib/repositories/auditRepository';

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1, 'orderedIds must contain at least one id'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminSession();
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid reorder payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await reorderProducts(parsed.data.orderedIds, user.uid);

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'product.reorder',
      entityType: 'product',
      entityId: 'catalog',
      metadata: { count: updated },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin products] reorder failed', err);
    return NextResponse.json({ error: 'Failed to reorder products' }, { status: 500 });
  }
}
