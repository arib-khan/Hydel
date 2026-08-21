// src/app/api/admin/upload/sign/route.ts
// Returns a short-lived Cloudinary upload signature so the admin browser can
// upload media directly to Cloudinary without the API secret ever touching
// the client. The optional { target } in the request body picks the
// destination folder; it defaults to "products" so existing callers that send
// no body (the product form) keep working unchanged.
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import {
  createProductUploadSignature,
  createCarouselUploadSignature,
} from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();

    // Body is optional; a plain POST with no body must still succeed.
    let target: string | undefined;
    try {
      const body = await request.json();
      target = body?.target;
    } catch {
      target = undefined;
    }

    const signature =
      target === 'carousel' ? createCarouselUploadSignature() : createProductUploadSignature();

    return NextResponse.json(signature);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin upload] failed to sign upload', err);
    return NextResponse.json({ error: 'Failed to prepare media upload' }, { status: 500 });
  }
}
