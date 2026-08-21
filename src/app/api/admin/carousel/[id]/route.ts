// src/app/api/admin/carousel/[id]/route.ts
// Per-slide admin operations.
//   PUT    -> update slide fields (alt text, or replace media)
//   DELETE -> remove the slide and best-effort delete its Cloudinary asset
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import {
  getSlideById,
  updateSlide,
  deleteSlide,
} from '@/lib/repositories/carouselRepository';
import { carouselSlideUpdateSchema } from '@/lib/validation/carousel';
import { logAction } from '@/lib/repositories/auditRepository';
import { deleteAsset } from '@/lib/cloudinary';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = carouselSlideUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid slide data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await getSlideById(id);
    if (!existing) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });

    // If the media was replaced, clean up the old Cloudinary asset.
    if (
      parsed.data.publicId &&
      existing.publicId &&
      parsed.data.publicId !== existing.publicId
    ) {
      deleteAsset(existing.publicId, existing.type).catch((e) =>
        console.error('[admin carousel] failed to delete replaced asset', e)
      );
    }

    const slide = await updateSlide(id, parsed.data, user.uid);

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'carousel.update',
      entityType: 'carousel',
      entityId: id,
      metadata: { changedFields: Object.keys(parsed.data) },
    });

    return NextResponse.json({ slide });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin carousel] update failed', err);
    return NextResponse.json({ error: 'Failed to update carousel slide' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    const { id } = await params;

    const existing = await getSlideById(id);
    if (!existing) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });

    await deleteSlide(id);

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'carousel.delete',
      entityType: 'carousel',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin carousel] delete failed', err);
    return NextResponse.json({ error: 'Failed to delete carousel slide' }, { status: 500 });
  }
}
