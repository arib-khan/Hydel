// src/lib/validation/inquiry.ts
import { z } from 'zod';

export const inquiryInputSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1),
  productSlug: z.string().optional(),
  customerName: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number')
    .max(20, 'Please enter a valid phone number'),
  company: z.string().trim().optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Please add a short message'),
  quantity: z.string().trim().optional().or(z.literal('')),
  additionalRequirements: z.string().trim().optional().or(z.literal('')),
  // Honeypot field - real users never fill this in.
  website: z.string().max(0).optional().or(z.literal('')),
});

export type InquiryInputParsed = z.infer<typeof inquiryInputSchema>;

export const inquiryStatusSchema = z.enum(['new', 'in_progress', 'contacted', 'closed']);
