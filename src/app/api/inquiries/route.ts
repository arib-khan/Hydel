// src/app/api/inquiries/route.ts
//
// Public endpoint used by the "Inquire About This Product" form. Order of
// operations matters (see project spec): save to Firestore FIRST, then
// attempt the email notification. An email failure must never lose the
// inquiry - Firestore is the source of truth.
import { NextRequest, NextResponse } from 'next/server';
import { inquiryInputSchema } from '@/lib/validation/inquiry';
import { createInquiry, markInquiryEmailResult } from '@/lib/repositories/inquiryRepository';
import { sendInquiryNotificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`inquiry:${ip}`);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many inquiries submitted. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = inquiryInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check the highlighted fields.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Honeypot: silently "succeed" without doing anything if a bot filled it in.
    if (parsed.data.website) {
      return NextResponse.json({ success: true, inquiryId: 'ok' });
    }

    const { website: _honeypot, ...inquiryInput } = parsed.data;
    void _honeypot;

    // 1. Save to Firestore - this is the durable source of truth.
    const inquiry = await createInquiry(inquiryInput, {
      ip,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // 2. Best-effort email notification. Never let this fail the request.
    try {
      await sendInquiryNotificationEmail(inquiry);
      await markInquiryEmailResult(inquiry.id, true);
    } catch (emailErr) {
      console.error('[inquiries] email notification failed', emailErr);
      await markInquiryEmailResult(
        inquiry.id,
        false,
        emailErr instanceof Error ? emailErr.message : 'Unknown email error'
      );
    }

    return NextResponse.json({ success: true, inquiryId: inquiry.id }, { status: 201 });
  } catch (err) {
    console.error('[inquiries] submission failed', err);
    return NextResponse.json(
      { error: 'Something went wrong submitting your inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
