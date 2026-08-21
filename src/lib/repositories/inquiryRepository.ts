// src/lib/repositories/inquiryRepository.ts
import 'server-only';
import { getAdminDb } from '@/lib/firebase/admin';
import type { Inquiry, InquiryInput, InquiryStatus, InquiryNote } from '@/types/inquiry';

const COLLECTION = 'inquiries';

export async function createInquiry(
  input: InquiryInput,
  meta: { ip?: string; userAgent?: string }
): Promise<Inquiry> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();
  const now = Date.now();

  const inquiry: Inquiry = {
    ...input,
    id: ref.id,
    status: 'new',
    notes: [],
    emailNotificationSent: false,
    emailNotificationError: null,
    createdAt: now,
    updatedAt: now,
    ip: meta.ip,
    userAgent: meta.userAgent,
  };

  await ref.set(inquiry);
  return inquiry;
}

export async function markInquiryEmailResult(id: string, sent: boolean, error?: string) {
  const db = getAdminDb();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({ emailNotificationSent: sent, emailNotificationError: error ?? null });
}

export interface ListInquiriesOptions {
  status?: InquiryStatus;
  productId?: string;
  search?: string;
  sortDir?: 'asc' | 'desc';
}

export async function listInquiries(opts: ListInquiriesOptions = {}): Promise<Inquiry[]> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db.collection(COLLECTION);

  if (opts.status) query = query.where('status', '==', opts.status);
  if (opts.productId) query = query.where('productId', '==', opts.productId);

  const snap = await query.get();
  let inquiries = snap.docs.map((d) => d.data() as Inquiry);

  if (opts.search) {
    const q = opts.search.toLowerCase();
    inquiries = inquiries.filter(
      (i) =>
        i.customerName.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.company?.toLowerCase().includes(q) ||
        i.productName.toLowerCase().includes(q)
    );
  }

  const dir = opts.sortDir === 'asc' ? 1 : -1;
  inquiries.sort((a, b) => dir * (a.createdAt - b.createdAt));

  return inquiries;
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Inquiry;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).update({ status, updatedAt: Date.now() });
}

export async function addInquiryNote(
  id: string,
  note: Omit<InquiryNote, 'id' | 'createdAt'>
): Promise<InquiryNote> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const fullNote: InquiryNote = {
    ...note,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const doc = await ref.get();
  const existing = (doc.data() as Inquiry | undefined)?.notes ?? [];
  await ref.update({ notes: [...existing, fullNote], updatedAt: Date.now() });
  return fullNote;
}

export async function getInquiryStats() {
  const db = getAdminDb();
  const [totalSnap, newSnap, inProgressSnap, contactedSnap, closedSnap] = await Promise.all([
    db.collection(COLLECTION).count().get(),
    db.collection(COLLECTION).where('status', '==', 'new').count().get(),
    db.collection(COLLECTION).where('status', '==', 'in_progress').count().get(),
    db.collection(COLLECTION).where('status', '==', 'contacted').count().get(),
    db.collection(COLLECTION).where('status', '==', 'closed').count().get(),
  ]);
  return {
    total: totalSnap.data().count,
    new: newSnap.data().count,
    inProgress: inProgressSnap.data().count,
    contacted: contactedSnap.data().count,
    closed: closedSnap.data().count,
  };
}

export async function getRecentInquiries(limit = 5): Promise<Inquiry[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map((d) => d.data() as Inquiry);
}
