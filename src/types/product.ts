// src/types/product.ts
// Canonical Product type, preserving every field from the original products.json
// so no existing data or component prop is discarded during the Firestore migration.

export interface ProductTechnical {
  // Fully flexible key/value technical spec map, e.g. thickness, density,
  // tensileStrength, elongation, hardness, etc. Different products can have
  // completely different keys.
  [key: string]: string;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface Product {
  // Firestore document id (string). The original numeric `legacyId` is kept
  // for traceability back to products.json.
  id: string;
  legacyId?: number;

  slug: string;

  name: string;
  description: string;
  fullDescription?: string;
  price?: number;

  // Cloudinary secure URL (public delivery URL for the primary image).
  image: string;
  // Cloudinary public_id, needed to replace/delete the asset later.
  imagePublicId?: string;

  material: string;
  customizable: boolean;

  // Manual sort order for the public storefront grid. Lower numbers appear
  // first. Assigned/rewritten by the admin "Reorder products" screen. When
  // undefined (e.g. legacy or freshly created products that predate any
  // reorder) the storefront falls back to legacyId ordering.
  position?: number;

  colors?: string[];
  sizes?: string[];

  temperatureRange?: string;
  pressureRating?: string;

  applications?: string[];
  features?: string[];
  standards?: string[];
  compliance?: string;

  technical?: ProductTechnical;

  seo?: ProductSEO;

  // Soft delete + audit metadata
  deleted: boolean;
  deletedAt?: number | null;

  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
}

// Shape accepted by the create/update admin API (id/timestamps are server-assigned).
// slug is optional on input - the repository will derive it from the name when omitted.
// position is server-managed (assigned on create, rewritten by the reorder screen).
export type ProductInput = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'deletedAt' | 'createdBy' | 'updatedBy' | 'slug' | 'position'
> & { slug?: string };

// The exact shape of an entry in the legacy products.json file, used only by
// the migration script.
export interface LegacyProduct {
  id: number;
  name: string;
  description: string;
  fullDescription?: string;
  price?: number;
  image: string;
  material: string;
  customizable: boolean;
  colors?: string[];
  sizes?: string[];
  temperatureRange?: string;
  pressureRating?: string;
  applications?: string[];
  features?: string[];
  standards?: string[];
  compliance?: string;
  technical?: Record<string, string>;
}
