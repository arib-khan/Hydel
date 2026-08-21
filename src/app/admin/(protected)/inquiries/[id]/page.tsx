// src/app/admin/(protected)/inquiries/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getInquiryById } from '@/lib/repositories/inquiryRepository';
import InquiryDetailClient from './InquiryDetailClient';

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);

  if (!inquiry) notFound();

  return <InquiryDetailClient inquiry={inquiry} />;
}