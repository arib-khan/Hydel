// src/lib/repositories/auditRepository.ts
import 'server-only';
import { getAdminDb } from '@/lib/firebase/admin';
import type { AuditLogEntry } from '@/types/admin';

const COLLECTION = 'auditLogs';

export async function logAction(entry: {
  actorUid: string;
  actorEmail: string;
  action: string;
  entityType: AuditLogEntry['entityType'];
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();
  const log: AuditLogEntry = {
    ...entry,
    id: ref.id,
    createdAt: Date.now(),
  };
  // Audit logging must never block or fail the primary action.
  try {
    await ref.set(log);
  } catch (err) {
    console.error('[audit] failed to write audit log entry', err);
  }
}

export async function listRecentAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map((d) => d.data() as AuditLogEntry);
}
