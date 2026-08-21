// src/lib/validation/product.ts
import { z } from 'zod';

export const productInputSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(10, 'Description is required'),
  fullDescription: z.string().trim().optional(),
  price: z.number().nonnegative().optional(),
  image: z.string().url('A product image is required'),
  imagePublicId: z.string().optional(),
  material: z.string().trim().min(1, 'Material is required'),
  customizable: z.boolean(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  temperatureRange: z.string().optional(),
  pressureRating: z.string().optional(),
  applications: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  standards: z.array(z.string()).optional(),
  compliance: z.string().optional(),
  technical: z.record(z.string(), z.string()).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  legacyId: z.number().optional(),
});

export type ProductInputParsed = z.infer<typeof productInputSchema>;

export const productUpdateSchema = productInputSchema.partial();
