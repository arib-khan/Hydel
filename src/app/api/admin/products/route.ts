// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { listAdminProducts, createProduct } from '@/lib/repositories/productRepository';
import { productInputSchema } from '@/lib/validation/product';
import { logAction } from '@/lib/repositories/auditRepository';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdminSession();
    const { searchParams } = new URL(request.url);

    const products = await listAdminProducts({
      search: searchParams.get('search') || undefined,
      includeDeleted: searchParams.get('includeDeleted') === 'true',
      sortBy: (searchParams.get('sortBy') as 'name' | 'createdAt' | 'updatedAt' | 'position') || undefined,
      sortDir: (searchParams.get('sortDir') as 'asc' | 'desc') || undefined,
    });

    void user;
    return NextResponse.json({ products });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin products] list failed', err);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminSession();
    const body = await request.json();
    const parsed = productInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product data', details: parsed.error.flatten() }, { status: 400 });
    }

    const product = await createProduct(parsed.data, user.uid);

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'product.create',
      entityType: 'product',
      entityId: product.id,
      metadata: { name: product.name },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin products] create failed', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
