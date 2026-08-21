// scripts/migrate-products.ts
//
// One-time (and safely re-runnable) migration from src/app/products/products.json
// into Firestore. Run with:
//
//   npx tsx scripts/migrate-products.ts
//
// Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
// in the environment (same as the app's Admin SDK credentials), plus
// Cloudinary credentials so it can upload the existing local images.
//
// What it does:
//   1. Reads and validates products.json.
//   2. For each product, uploads its local /public image to Cloudinary
//      (unless --skip-images is passed, in which case the local path is kept
//      temporarily so you can run image migration separately).
//   3. Upserts a Firestore product document keyed by the original numeric id
//      (legacyId), so running this script multiple times updates the same
//      documents instead of creating duplicates.
//   4. Reports any field it could not map instead of silently dropping it.
//
// Usage:
//   npx tsx scripts/migrate-products.ts             # full migration incl. images
//   npx tsx scripts/migrate-products.ts --skip-images  # Firestore only, keep local image paths

import './loadEnv';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import type { LegacyProduct, Product } from '../src/types/product';

const PRODUCTS_COLLECTION = 'products';

const KNOWN_FIELDS = new Set<keyof LegacyProduct>([
  'id',
  'name',
  'description',
  'fullDescription',
  'price',
  'image',
  'material',
  'customizable',
  'colors',
  'sizes',
  'temperatureRange',
  'pressureRating',
  'applications',
  'features',
  'standards',
  'compliance',
  'technical',
]);

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function initFirebaseAdmin(): Firestore {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials in the environment.');
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  }
  const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

// Standalone equivalent of productRepository.upsertProductByLegacyId(),
// duplicated here (rather than imported) because that module - and every
// other file under src/lib - is marked 'server-only', which intentionally
// throws when loaded outside Next.js's server build pipeline. A plain CLI
// script run via tsx is exactly that case, so this script talks to
// Firestore directly instead of importing app repository code.
async function upsertProductByLegacyId(
  db: Firestore,
  legacyId: number,
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'deletedAt'>
): Promise<{ id: string; created: boolean }> {
  const collection = db.collection(PRODUCTS_COLLECTION);
  const existingSnap = await collection.where('legacyId', '==', legacyId).limit(1).get();

  if (!existingSnap.empty) {
    const doc = existingSnap.docs[0];
    await doc.ref.update({ ...data, updatedAt: Date.now() });
    return { id: doc.id, created: false };
  }

  const ref = collection.doc();
  const now = Date.now();
  await ref.set({
    ...data,
    id: ref.id,
    deleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, created: true };
}

function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary credentials in the environment.');
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

async function uploadLocalImageToCloudinary(localImagePath: string, publicIdHint: string) {
  // products.json stores paths like "/products-images/Graphite-Gasket-min.png",
  // which map directly onto files under /public in this repo.
  const absolutePath = path.join(process.cwd(), 'public', localImagePath.replace(/^\//, ''));

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Local image not found: ${absolutePath}`);
  }

  const result = await cloudinary.uploader.upload(absolutePath, {
    folder: 'hydel/products',
    public_id: publicIdHint,
    overwrite: true,
  });

  return { url: result.secure_url, publicId: result.public_id };
}

async function main() {
  const skipImages = process.argv.includes('--skip-images');

  const jsonPath = path.join(process.cwd(), 'src/app/products/products.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const legacyProducts = JSON.parse(raw) as LegacyProduct[];

  console.log(`Loaded ${legacyProducts.length} products from products.json`);

  const db = initFirebaseAdmin();
  if (!skipImages) initCloudinary();

  let created = 0;
  let updated = 0;
  const errors: { product: string; error: string }[] = [];

  for (const legacy of legacyProducts) {
    try {
      const unknownFields = Object.keys(legacy).filter(
        (k) => !KNOWN_FIELDS.has(k as keyof LegacyProduct)
      );
      if (unknownFields.length > 0) {
        console.warn(`⚠️  ${legacy.name}: unrecognized fields kept as-is: ${unknownFields.join(', ')}`);
      }

      let imageUrl = legacy.image;
      let imagePublicId: string | undefined;

      if (!skipImages) {
        const publicIdHint = `${slugify(legacy.name)}-${legacy.id}`;
        const uploaded = await uploadLocalImageToCloudinary(legacy.image, publicIdHint);
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
        console.log(`   ↳ uploaded image for "${legacy.name}" -> ${imageUrl}`);
      }

      const slug = slugify(legacy.name);

      const { id, created: wasCreated } = await upsertProductByLegacyId(db, legacy.id, {
        legacyId: legacy.id,
        slug,
        name: legacy.name,
        description: legacy.description,
        fullDescription: legacy.fullDescription,
        price: legacy.price,
        image: imageUrl,
        imagePublicId,
        material: legacy.material,
        customizable: legacy.customizable,
        colors: legacy.colors,
        sizes: legacy.sizes,
        temperatureRange: legacy.temperatureRange,
        pressureRating: legacy.pressureRating,
        applications: legacy.applications,
        features: legacy.features,
        standards: legacy.standards,
        compliance: legacy.compliance,
        technical: legacy.technical,
        createdBy: 'migration-script',
        updatedBy: 'migration-script',
      });

      if (wasCreated) {
        created += 1;
        console.log(`✅ Created product ${id} (${legacy.name})`);
      } else {
        updated += 1;
        console.log(`♻️  Updated existing product ${id} (${legacy.name})`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ product: legacy.name, error: message });
      console.error(`❌ Failed to migrate "${legacy.name}": ${message}`);
    }
  }

  console.log('\n--- Migration summary ---');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors:  ${errors.length}`);
  if (errors.length > 0) {
    console.log(JSON.stringify(errors, null, 2));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exitCode = 1;
});