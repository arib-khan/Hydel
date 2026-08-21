// src/app/api/admin/inquiries/[id]/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { addInquiryNote } from '@/lib/repositories/inquiryRepository';
import { logAction } from '@/lib/repositories/auditRepository';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAdminSession();
    const { id } = await params;
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Note message is required' }, { status: 400 });
    }

    const note = await addInquiryNote(id, {
      authorId: user.uid,
      authorEmail: user.email,
      message: message.trim(),
    });

    await logAction({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'inquiry.note_added',
      entityType: 'inquiry',
      entityId: id,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin inquiries] add note failed', err);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
