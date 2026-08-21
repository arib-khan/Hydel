// src/app/api/admin/inquiries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { listInquiries } from '@/lib/repositories/inquiryRepository';
import { inquiryStatusSchema } from '@/lib/validation/inquiry';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const statusParsed = statusParam ? inquiryStatusSchema.safeParse(statusParam) : undefined;

    const inquiries = await listInquiries({
      status: statusParsed?.success ? statusParsed.data : undefined,
      productId: searchParams.get('productId') || undefined,
      search: searchParams.get('search') || undefined,
      sortDir: (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc',
    });

    return NextResponse.json({ inquiries });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin inquiries] list failed', err);
    return NextResponse.json({ error: 'Failed to load inquiries' }, { status: 500 });
  }
}
