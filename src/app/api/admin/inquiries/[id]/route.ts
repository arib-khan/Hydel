// src/app/api/admin/inquiries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { getInquiryById, updateInquiryStatus } from '@/lib/repositories/inquiryRepository';
import { inquiryStatusSchema } from '@/lib/validation/inquiry';
import { logAction } from '@/lib/repositories/auditRepository';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const inquiry = await getInquiryById(id);
    if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    return NextResponse.json({ inquiry });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to load inquiry' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = inquiryStatusSchema.safeParse(body.status);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existing = await getInquiryById(id);
    if (!existing) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });

    await updateInquiryStatus(id, parsed.data);
    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'inquiry.status_change',
      entityType: 'inquiry',
      entityId: id,
      metadata: { from: existing.status, to: parsed.data },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin inquiries] status update failed', err);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}
