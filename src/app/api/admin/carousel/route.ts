// src/app/api/admin/carousel/route.ts
// Admin CRUD entry point for homepage carousel slides.
//   GET  -> list all slides in display order
//   POST -> create a new slide (appended to the end)
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { listAdminSlides, createSlide } from '@/lib/repositories/carouselRepository';
import { carouselSlideInputSchema } from '@/lib/validation/carousel';
import { logAction } from '@/lib/repositories/auditRepository';

export async function GET() {
  try {
    await requireAdminSession();
    const slides = await listAdminSlides();
    return NextResponse.json({ slides });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin carousel] list failed', err);
    return NextResponse.json({ error: 'Failed to load carousel slides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminSession();
    const body = await request.json();
    const parsed = carouselSlideInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid slide data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const slide = await createSlide(parsed.data, user.uid);

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'carousel.create',
      entityType: 'carousel',
      entityId: slide.id,
      metadata: { type: slide.type },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin carousel] create failed', err);
    return NextResponse.json({ error: 'Failed to create carousel slide' }, { status: 500 });
  }
}
