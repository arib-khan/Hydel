// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  try {
    // Email to yourself (original functionality)
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2c3e50;">📩 New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 120px;">👤 Name:</td>
              <td style="padding: 8px; background-color: #fff;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">📧 Email:</td>
              <td style="padding: 8px; background-color: #fff;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; vertical-align: top;">💬 Message:</td>
              <td style="padding: 8px; background-color: #fff;">${message}</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #7f8c8d; margin-top: 20px;">This message was sent from your website contact form.</p>
        </div>
      `,
    });

    // New: Confirmation email to the submitter
    await transporter.sendMail({
      from: `"Hydel Marketing & Services" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting us, ${name}!`,
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f5f7fa; padding: 25px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
  
  <h2 style="color: #005b82; margin-bottom: 20px;">Thank you for contacting Hydel!</h2>
  
  <p style="color: #333; line-height: 1.6;">Dear ${name},</p>
  <p style="color: #333; line-height: 1.6;">We appreciate you reaching out to us regarding your industrial requirements. Our team has received your inquiry and will respond within 24 business hours.</p>
  
  <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff6b35;">
    <p style="font-weight: bold; color: #005b82; margin-bottom: 10px;">Your inquiry details:</p>
    <p style="color: #333; line-height: 1.6;">${message}</p>
  </div>
  
  <p style="color: #333; line-height: 1.6;">For immediate assistance with industrial products, please contact our support team:</p>
  
  <ul style="color: #333; line-height: 1.6; padding-left: 20px;">
    <li><strong>Technical Support:</strong> +91-9827059392</li>
    <li><strong>Sales Enquiries:</strong> hydel92@gmail.com</li>
  </ul>
  
  <p style="color: #333; line-height: 1.6; margin-top: 20px;">At Hydel, we're committed to providing innovative solutions for your industrial flow control needs.</p>
  
  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
    <p style="color: #005b82; font-weight: bold;">Best regards,</p>
    <p style="color: #333;">The Hydel Team</p>
    <p style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
      Hydel Industries | Specialists in Industrial Valves & Gates
    </p>
  </div>
  
  <div style="font-size: 10px; color: #95a5a6; margin-top: 20px; text-align: center;">
    <p>This is an automated message. Please do not reply directly to this email.</p>
    <p>© ${new Date().getFullYear()} Hydel Marketing & Services. All rights reserved.</p>
  </div>
</div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}