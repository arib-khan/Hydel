// src/types/admin.ts

export type AdminRole = 'superadmin' | 'admin';

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: AdminRole;
  disabled: boolean;
  mfaEnrolled: boolean;
  createdAt: number;
  createdBy?: string;
  updatedAt: number;
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string; // e.g. 'product.create', 'inquiry.status_change', 'admin.create'
  entityType: 'product' | 'inquiry' | 'admin' | 'settings' | 'carousel';
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}
