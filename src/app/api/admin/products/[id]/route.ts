// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import {
  getAdminProductById,
  updateProduct,
  softDeleteProduct,
  permanentlyDeleteProduct,
} from '@/lib/repositories/productRepository';
import { productUpdateSchema } from '@/lib/validation/product';
import { logAction } from '@/lib/repositories/auditRepository';
import { deleteProductImage } from '@/lib/cloudinary';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const product = await getAdminProductById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product data', details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await getAdminProductById(id);
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // If the image changed, clean up the old Cloudinary asset.
    if (
      parsed.data.imagePublicId &&
      existing.imagePublicId &&
      parsed.data.imagePublicId !== existing.imagePublicId
    ) {
      deleteProductImage(existing.imagePublicId).catch((e) =>
        console.error('[admin products] failed to delete old cloudinary image', e)
      );
    }

    const product = await updateProduct(id, parsed.data, user.uid);

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'product.update',
      entityType: 'product',
      entityId: id,
      metadata: { changedFields: Object.keys(parsed.data) },
    });

    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin products] update failed', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      if (user.role !== 'superadmin') {
        return NextResponse.json(
          { error: 'Only Super Admins can permanently delete products.' },
          { status: 403 }
        );
      }
      await permanentlyDeleteProduct(id);
      await logAction({
        actorUid: user.uid,
        actorEmail: user.email,
        action: 'product.permanent_delete',
        entityType: 'product',
        entityId: id,
      });
      return NextResponse.json({ success: true, permanent: true });
    }

    await softDeleteProduct(id, user.uid);
    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'product.delete',
      entityType: 'product',
      entityId: id,
    });
    return NextResponse.json({ success: true, permanent: false });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin products] delete failed', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
