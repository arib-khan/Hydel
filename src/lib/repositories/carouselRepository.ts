// src/lib/repositories/carouselRepository.ts
import 'server-only';
import { getAdminDb } from '@/lib/firebase/admin';
import { deleteAsset } from '@/lib/cloudinary';
import type { CarouselSlide, CarouselSlideInput } from '@/types/carousel';

const COLLECTION = 'carouselSlides';

function sortByPosition(slides: CarouselSlide[]): CarouselSlide[] {
  return slides.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return (a.createdAt ?? 0) - (b.createdAt ?? 0);
  });
}

/** Slides for the public homepage carousel, in display order. */
export async function listPublicSlides(): Promise<CarouselSlide[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  return sortByPosition(snap.docs.map((d) => d.data() as CarouselSlide));
}

/** Slides for the admin manager (same set/order; separate name for intent). */
export async function listAdminSlides(): Promise<CarouselSlide[]> {
  return listPublicSlides();
}

export async function getSlideById(id: string): Promise<CarouselSlide | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as CarouselSlide;
}

/** Position that puts a new slide at the end of the carousel. */
async function getNextPosition(): Promise<number> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  let max = -1;
  snap.docs.forEach((d) => {
    const p = (d.data() as CarouselSlide).position;
    if (typeof p === 'number' && p > max) max = p;
  });
  return max + 1;
}

export async function createSlide(
  input: CarouselSlideInput,
  actorUid: string
): Promise<CarouselSlide> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();
  const now = Date.now();

  const slide: CarouselSlide = {
    ...input,
    alt: input.alt ?? '',
    id: ref.id,
    position: await getNextPosition(),
    createdAt: now,
    updatedAt: now,
    createdBy: actorUid,
    updatedBy: actorUid,
  };

  await ref.set(slide);
  return slide;
}

export async function updateSlide(
  id: string,
  input: Partial<CarouselSlideInput>,
  actorUid: string
): Promise<CarouselSlide> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) throw new Error('Slide not found');

  await ref.update({ ...input, updatedAt: Date.now(), updatedBy: actorUid });
  const updated = await ref.get();
  return updated.data() as CarouselSlide;
}

/** Removes a slide and best-effort deletes its Cloudinary asset. */
export async function deleteSlide(id: string): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return;

  const slide = doc.data() as CarouselSlide;
  if (slide.publicId) {
    // Never let a storage cleanup failure block removing the slide.
    deleteAsset(slide.publicId, slide.type).catch((e) =>
      console.error('[carousel] failed to delete cloudinary asset', e)
    );
  }

  await ref.delete();
}

/** Rewrites slide positions to match `orderedIds`, as one atomic batch. */
export async function reorderSlides(orderedIds: string[], actorUid: string): Promise<number> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
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

export async function countSlides(): Promise<number> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).count().get();
  return snap.data().count;
}
