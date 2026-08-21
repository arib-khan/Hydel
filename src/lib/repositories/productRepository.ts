// src/lib/repositories/productRepository.ts
import 'server-only';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Product, ProductInput } from '@/types/product';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION = 'products';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export { slugify };

/**
 * Effective storefront sort key for a product. Products that have been placed
 * with the admin "Reorder" screen use their explicit `position`; everything
 * else falls back to its original legacyId so untouched catalogs keep their
 * historical order. Products with neither (admin-created before any reorder)
 * sink to the end.
 */
function storefrontSortKey(p: Product): number {
  if (typeof p.position === 'number') return p.position;
  if (typeof p.legacyId === 'number') return p.legacyId;
  return Number.MAX_SAFE_INTEGER;
}

/** Public-facing read: only non-deleted products, ordered for the storefront grid. */
export async function listPublicProducts(): Promise<Product[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).where('deleted', '==', false).get();
  const products = snap.docs.map((d) => d.data() as Product);
  return products.sort((a, b) => {
    const ka = storefrontSortKey(a);
    const kb = storefrontSortKey(b);
    if (ka !== kb) return ka - kb;
    // Stable tie-breaker so equal keys don't reshuffle between requests.
    return (a.createdAt ?? 0) - (b.createdAt ?? 0);
  });
}

export async function getPublicProductBySlug(slug: string): Promise<Product | null> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where('slug', '==', slug)
    .where('deleted', '==', false)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as Product;
}

export interface ListAdminProductsOptions {
  search?: string;
  includeDeleted?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'position';
  sortDir?: 'asc' | 'desc';
}

/** Admin read: everything, with basic in-memory search/sort (catalog is small). */
export async function listAdminProducts(opts: ListAdminProductsOptions = {}): Promise<Product[]> {
  const db = getAdminDb();
  let snap;
  if (opts.includeDeleted) {
    snap = await db.collection(COLLECTION).get();
  } else {
    snap = await db.collection(COLLECTION).where('deleted', '==', false).get();
  }
  let products = snap.docs.map((d) => d.data() as Product);

  if (opts.search) {
    const q = opts.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  const sortBy = opts.sortBy || 'updatedAt';
  const dir = opts.sortDir === 'asc' ? 1 : -1;
  products.sort((a, b) => {
    if (sortBy === 'name') return dir * a.name.localeCompare(b.name);
    // "position" sorts by the same effective key the storefront uses, so the
    // reorder screen shows products in exactly the order visitors see them.
    if (sortBy === 'position') {
      const diff = storefrontSortKey(a) - storefrontSortKey(b);
      return diff !== 0 ? dir * diff : dir * ((a.createdAt ?? 0) - (b.createdAt ?? 0));
    }
    return dir * ((a[sortBy] as number) - (b[sortBy] as number));
  });

  return products;
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Product;
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  const db = getAdminDb();
  let slug = baseSlug;
  let suffix = 1;
  // Small catalog - a straightforward existence check per candidate is fine.
  while (true) {
    const snap = await db.collection(COLLECTION).where('slug', '==', slug).get();
    const conflict = snap.docs.some((d) => d.id !== excludeId);
    if (!conflict) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

/**
 * Position to give a brand-new product so it appears at the END of the
 * storefront grid. Once any product has an explicit position (i.e. the admin
 * has used the Reorder screen at least once) we return max+1. Before that we
 * return undefined so the new product simply keeps falling back to legacyId
 * ordering (and, having no legacyId, sinks to the end) rather than jumping
 * ahead of the legacy-ordered catalog.
 */
async function getNextPosition(): Promise<number | undefined> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  let max = -1;
  let anyPositioned = false;
  snap.docs.forEach((d) => {
    const p = (d.data() as Product).position;
    if (typeof p === 'number') {
      anyPositioned = true;
      if (p > max) max = p;
    }
  });
  return anyPositioned ? max + 1 : undefined;
}

export async function createProduct(input: ProductInput, actorUid: string): Promise<Product> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();
  const now = Date.now();
  const baseSlug = input.slug ? slugify(input.slug) : slugify(input.name);
  const slug = await ensureUniqueSlug(baseSlug);
  const position = await getNextPosition();

  const product: Product = {
    ...input,
    id: ref.id,
    slug,
    position,
    deleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    createdBy: actorUid,
    updatedBy: actorUid,
  };

  await ref.set(product);
  return product;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  actorUid: string
): Promise<Product> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    throw new Error('Product not found');
  }

  const updates: Partial<Product> = { ...input, updatedAt: Date.now(), updatedBy: actorUid };

  if (input.name || input.slug) {
    const baseSlug = slugify(input.slug || input.name || (existing.data() as Product).name);
    updates.slug = await ensureUniqueSlug(baseSlug, id);
  }

  await ref.update(updates as { [x: string]: FieldValue | Partial<unknown> | undefined });
  const updated = await ref.get();
  return updated.data() as Product;
}

/**
 * Persist a new storefront order. `orderedIds` is the full list of product
 * ids in the desired display order; each product's `position` is rewritten to
 * its index in that array. Runs as a single atomic batch so the grid never
 * renders a half-applied order. Returns the number of products updated.
 */
export async function reorderProducts(orderedIds: string[], actorUid: string): Promise<number> {
  const db = getAdminDb();

  // Only touch ids that actually exist and aren't deleted, so a stale client
  // list can't create phantom/positioned ghost documents.
  const snap = await db.collection(COLLECTION).where('deleted', '==', false).get();
  const existingIds = new Set(snap.docs.map((d) => d.id));

  const batch = db.batch();
  const now = Date.now();
  let index = 0;
  let updated = 0;
  for (const id of orderedIds) {
    if (!existingIds.has(id)) continue;
    batch.update(db.collection(COLLECTION).doc(id), {
      position: index,
      updatedAt: now,
      updatedBy: actorUid,
    });
    index += 1;
    updated += 1;
  }

  if (updated > 0) await batch.commit();
  return updated;
}

export async function softDeleteProduct(id: string, actorUid: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).update({
    deleted: true,
    deletedAt: Date.now(),
    updatedAt: Date.now(),
    updatedBy: actorUid,
  });
}

export async function restoreProduct(id: string, actorUid: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).update({
    deleted: false,
    deletedAt: null,
    updatedAt: Date.now(),
    updatedBy: actorUid,
  });
}

export async function permanentlyDeleteProduct(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).delete();
}

/** Idempotent upsert used by the migration script (keyed by legacyId). */
export async function upsertProductByLegacyId(
  legacyId: number,
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'deletedAt'>
): Promise<{ id: string; created: boolean }> {
  const db = getAdminDb();
  const existingSnap = await db.collection(COLLECTION).where('legacyId', '==', legacyId).limit(1).get();

  if (!existingSnap.empty) {
    const doc = existingSnap.docs[0];
    await doc.ref.update({ ...data, updatedAt: Date.now() });
    return { id: doc.id, created: false };
  }

  const ref = db.collection(COLLECTION).doc();
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

export async function countProducts(): Promise<{ total: number; deleted: number }> {
  const db = getAdminDb();
  const [allSnap, deletedSnap] = await Promise.all([
    db.collection(COLLECTION).count().get(),
    db.collection(COLLECTION).where('deleted', '==', true).count().get(),
  ]);
  return { total: allSnap.data().count, deleted: deletedSnap.data().count };
}
