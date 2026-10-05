// app/api/send-email/route.ts
//
// Contact Us form endpoint. Emails the enquiry to Hydel's mailbox and sends an
// acknowledgement to the submitter. (Nothing is stored in Firestore here.)
//
// Hardened in the legal/consent update: schema validation + length limits,
// explicit privacy-consent requirement, honeypot, per-IP rate limiting,
// HTML escaping of all user input, and no internal error details returned.
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';
import { escapeHtml as esc } from '@/lib/escapeHtml';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(4000),
  privacyConsent: z.literal(true),
  website: z.string().max(0).optional().or(z.literal('')), // honeypot
});

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`contact:${getClientIp(request)}`);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the form and try again.' }, { status: 400 });
  }
  if (parsed.data.website) {
    // Honeypot filled: pretend success, send nothing.
    return NextResponse.json({ success: true });
  }

  const { name, email, message } = parsed.data;
  const safeName = esc(name);
  const safeEmail = esc(email);
  const safeMessage = esc(message);
  // Strip line breaks from anything used in an email header/subject.
  const subjectName = name.replace(/[\r\n]+/g, ' ').slice(0, 100);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  try {
    // Email to Hydel
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New message from ${subjectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2c3e50;">📩 New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 120px;">👤 Name:</td>
              <td style="padding: 8px; background-color: #fff;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">📧 Email:</td>
              <td style="padding: 8px; background-color: #fff;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; vertical-align: top;">💬 Message:</td>
              <td style="padding: 8px; background-color: #fff;">${safeMessage}</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #7f8c8d; margin-top: 20px;">This message was sent from your website contact form. The sender agreed to the Privacy Policy before submitting.</p>
        </div>
      `,
    });

    // Confirmation email to the submitter
    await transporter.sendMail({
      from: `"Hydel Marketing & Services" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting us, ${subjectName}!`,
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f5f7fa; padding: 25px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
  <h2 style="color: #005b82; margin-bottom: 20px;">Thank you for contacting Hydel!</h2>
  <p style="color: #333; line-height: 1.6;">Dear ${safeName},</p>
  <p style="color: #333; line-height: 1.6;">We appreciate you reaching out to us regarding your industrial requirements. Our team has received your inquiry and will respond within 24 business hours.</p>
  <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff6b35;">
    <p style="font-weight: bold; color: #005b82; margin-bottom: 10px;">Your inquiry details:</p>
    <p style="color: #333; line-height: 1.6;">${safeMessage}</p>
  </div>
  <p style="color: #333; line-height: 1.6;">For immediate assistance with industrial products, please contact our support team:</p>
  <ul style="color: #333; line-height: 1.6; padding-left: 20px;">
    <li><strong>Technical Support:</strong> +91-9827059392</li>
    <li><strong>Sales Enquiries:</strong> info@hydel.co.in</li>
  </ul>
  <p style="color: #333; line-height: 1.6; margin-top: 20px;">At Hydel, we're committed to providing innovative solutions for your industrial flow control needs.</p>
  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
    <p style="color: #005b82; font-weight: bold;">Best regards,</p>
    <p style="color: #333;">The Hydel Team</p>
  </div>
  <div style="font-size: 10px; color: #95a5a6; margin-top: 20px; text-align: center;">
    <p>You are receiving this because this email address was entered in the contact form on hydel.co.in. See our Privacy Policy: https://www.hydel.co.in/privacy-policy</p>
    <p>This is an automated message. Please do not reply directly to this email.</p>
    <p>© ${new Date().getFullYear()} Hydel Marketing & Services. All rights reserved.</p>
  </div>
</div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-email] failed', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
