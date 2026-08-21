// src/types/inquiry.ts

export type InquiryStatus = 'new' | 'in_progress' | 'contacted' | 'closed';

export interface InquiryNote {
  id: string;
  authorId: string;
  authorEmail: string;
  message: string;
  createdAt: number;
}

export interface Inquiry {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string;

  customerName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  quantity?: string;
  additionalRequirements?: string;

  status: InquiryStatus;
  notes?: InquiryNote[];

  emailNotificationSent: boolean;
  emailNotificationError?: string | null;

  createdAt: number;
  updatedAt: number;

  // Basic abuse-mitigation metadata
  ip?: string;
  userAgent?: string;
}

export type InquiryInput = {
  productId: string;
  productName: string;
  productSlug?: string;
  customerName: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  quantity?: string;
  additionalRequirements?: string;
};
