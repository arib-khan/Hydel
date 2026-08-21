// src/lib/validation/carousel.ts
import { z } from 'zod';

export const carouselSlideInputSchema = z.object({
  type: z.enum(['image', 'video']),
  src: z.string().url('A media URL is required'),
  publicId: z.string().optional(),
  // Alt text is optional (some hero media is purely decorative) but capped so
  // it stays a short label rather than a paragraph.
  alt: z.string().trim().max(200).optional(),
});

export type CarouselSlideInputParsed = z.infer<typeof carouselSlideInputSchema>;

export const carouselSlideUpdateSchema = carouselSlideInputSchema.partial();
