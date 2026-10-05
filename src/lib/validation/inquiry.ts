// src/lib/validation/inquiry.ts
import { z } from 'zod';

export const inquiryInputSchema = z.object({
  productId: z.string().min(1, 'Product is required').max(200),
  productName: z.string().min(1).max(300),
  productSlug: z.string().max(300).optional(),
  customerName: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().email('Please enter a valid email').max(254),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number')
    .max(20, 'Please enter a valid phone number'),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Please add a short message').max(4000),
  quantity: z.string().trim().max(100).optional().or(z.literal('')),
  additionalRequirements: z.string().trim().max(4000).optional().or(z.literal('')),
  // Explicit, user-given privacy-policy consent. Must be literally true.
  privacyConsent: z.literal(true, { error: 'You must agree to the Privacy Policy' }),
  // Honeypot field - real users never fill this in.
  website: z.string().max(0).optional().or(z.literal('')),
});

export type InquiryInputParsed = z.infer<typeof inquiryInputSchema>;

export const inquiryStatusSchema = z.enum(['new', 'in_progress', 'contacted', 'closed']);
