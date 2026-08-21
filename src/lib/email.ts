// src/lib/email.ts
//
// Reuses the project's existing NodeMailer configuration (the same
// GMAIL_USER / GMAIL_PASSWORD env vars already used by
// src/app/api/send-email/route.ts) instead of introducing a new provider.
import 'server-only';
import nodemailer from 'nodemailer';
import type { Inquiry } from '@/types/inquiry';

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error('Missing GMAIL_USER / GMAIL_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/**
 * Sends the "New Product Inquiry" notification to the configured admin
 * mailbox. Callers MUST treat a thrown error here as non-fatal: the inquiry
 * is already saved in Firestore by the time this runs (see
 * src/app/api/inquiries/route.ts), so an email failure must never lose data.
 */
export async function sendInquiryNotificationEmail(inquiry: Inquiry) {
  const transporter = getTransporter();
  const notifyTo = process.env.INQUIRY_NOTIFICATION_EMAIL || process.env.GMAIL_USER;
  const dashboardBase = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const dashboardLink = `${dashboardBase}/admin/inquiries/${inquiry.id}`;

  await transporter.sendMail({
    from: `"Hydel Website" <${process.env.GMAIL_USER}>`,
    to: notifyTo,
    subject: `New Product Inquiry — ${inquiry.productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #2c3e50;">📩 New Product Inquiry</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; width: 160px;">Product:</td><td style="padding: 8px; background:#fff;">${inquiry.productName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Customer:</td><td style="padding: 8px; background:#fff;">${inquiry.customerName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px; background:#fff;">${inquiry.email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px; background:#fff;">${inquiry.phone}</td></tr>
          ${inquiry.company ? `<tr><td style="padding: 8px; font-weight: bold;">Company:</td><td style="padding: 8px; background:#fff;">${inquiry.company}</td></tr>` : ''}
          ${inquiry.quantity ? `<tr><td style="padding: 8px; font-weight: bold;">Quantity:</td><td style="padding: 8px; background:#fff;">${inquiry.quantity}</td></tr>` : ''}
          <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td><td style="padding: 8px; background:#fff;">${inquiry.message}</td></tr>
          ${inquiry.additionalRequirements ? `<tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Additional Requirements:</td><td style="padding: 8px; background:#fff;">${inquiry.additionalRequirements}</td></tr>` : ''}
        </table>
        <p style="margin-top: 20px;">
          <a href="${dashboardLink}" style="background:#005b82;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none;">Open in Admin Dashboard</a>
        </p>
        <p style="font-size: 12px; color: #7f8c8d; margin-top: 20px;">This inquiry was submitted through the website and is already saved in the admin dashboard.</p>
      </div>
    `,
  });
}
