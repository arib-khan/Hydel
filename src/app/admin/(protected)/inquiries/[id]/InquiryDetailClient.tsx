// src/app/admin/(protected)/inquiries/[id]/InquiryDetailClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Inquiry, InquiryStatus } from '@/types/inquiry';
import { useAdminUI } from '../../ui/AdminUI';

const STATUS_STEPS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export default function InquiryDetailClient({ inquiry: initial }: { inquiry: Inquiry }) {
  const router = useRouter();
  const { toast } = useAdminUI();
  const [inquiry, setInquiry] = useState(initial);
  const [noteText, setNoteText] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(status: InquiryStatus) {
    setSavingStatus(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setInquiry((prev) => ({ ...prev, status }));
      toast(`Status changed to “${STATUS_STEPS.find((s) => s.value === status)?.label ?? status}”.`, 'success');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      setError(message);
      toast(message, 'error');
    } finally {
      setSavingStatus(false);
    }
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: noteText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add note');
      setInquiry((prev) => ({ ...prev, notes: [...(prev.notes || []), data.note] }));
      setNoteText('');
      toast('Note added.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add note';
      setError(message);
      toast(message, 'error');
    } finally {
      setSavingNote(false);
    }
  }

  const whatsappHref = `https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi ${inquiry.customerName}, thanks for your inquiry about ${inquiry.productName}.`
  )}`;

  return (
    <div className="admin-max-w-3xl admin-space-y-6">
      <div>
        <Link href="/admin/inquiries" className="admin-text-sm admin-text-blue">← Back to inquiries</Link>
        <h1 className="admin-heading admin-mt-2">{inquiry.customerName}</h1>
        <p className="admin-subheading">
          Inquiry about <strong>{inquiry.productName}</strong> · {new Date(inquiry.createdAt).toLocaleString()}
        </p>
      </div>

      {error && <p className="admin-text-sm admin-text-red">{error}</p>}

      <section className="admin-card">
        <h2 className="admin-card-title admin-mb-3">Status</h2>
        <div className="admin-flex admin-flex--wrap admin-gap-2">
          {STATUS_STEPS.map((step) => (
            <button
              key={step.value}
              disabled={savingStatus}
              onClick={() => changeStatus(step.value)}
              className={`admin-btn admin-btn--sm ${inquiry.status === step.value
                  ? 'admin-btn--primary'
                  : 'admin-btn--outline'
                }`}
            >
              {step.label}
            </button>
          ))}
        </div>
      </section>

      <section className="admin-card admin-inquiry-meta-grid">
        <div>
          <p className="admin-text-xs admin-text-muted">Email</p>
          <p className="admin-text-sm admin-text-slate-800">{inquiry.email}</p>
        </div>
        <div>
          <p className="admin-text-xs admin-text-muted">Phone</p>
          <p className="admin-text-sm admin-text-slate-800">{inquiry.phone}</p>
        </div>
        <div>
          <p className="admin-text-xs admin-text-muted">Company</p>
          <p className="admin-text-sm admin-text-slate-800">{inquiry.company || '—'}</p>
        </div>
        <div>
          <p className="admin-text-xs admin-text-muted">Quantity</p>
          <p className="admin-text-sm admin-text-slate-800">{inquiry.quantity || '—'}</p>
        </div>
        <div className="admin-col-span-2">
          <p className="admin-text-xs admin-text-muted">Product</p>
          {inquiry.productSlug ? (
            <Link href={`/products/${inquiry.productSlug}`} className="admin-text-sm admin-text-blue" target="_blank">
              {inquiry.productName} ↗
            </Link>
          ) : (
            <p className="admin-text-sm admin-text-slate-800">{inquiry.productName}</p>
          )}
        </div>
        <div className="admin-col-span-2">
          <p className="admin-text-xs admin-text-muted">Message</p>
          <p className="admin-text-sm admin-text-slate-800 admin-whitespace-pre-wrap">{inquiry.message}</p>
        </div>
        {inquiry.additionalRequirements && (
          <div className="admin-col-span-2">
            <p className="admin-text-xs admin-text-muted">Additional Requirements</p>
            <p className="admin-text-sm admin-text-slate-800 admin-whitespace-pre-wrap">{inquiry.additionalRequirements}</p>
          </div>
        )}
        <div className="admin-col-span-2 admin-text-xs admin-text-muted">
          Email notification: {inquiry.emailNotificationSent ? '✅ Sent' : `⚠️ Not sent${inquiry.emailNotificationError ? ` (${inquiry.emailNotificationError})` : ''}`}
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title admin-mb-2">Contact</h2>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn--success"
        >
          Contact via WhatsApp
        </a>
        <p className="admin-text-xs admin-text-muted admin-mt-2">
          Optional follow-up action only — this inquiry is already safely stored, independent of WhatsApp.
        </p>
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title admin-mb-3">Internal Notes</h2>
        <div className="admin-space-y-3 admin-mb-4">
          {(inquiry.notes || []).length === 0 && <p className="admin-text-sm admin-text-muted">No notes yet.</p>}
          {(inquiry.notes || []).map((note) => (
            <div key={note.id} className="admin-note">
              <p className="admin-text-sm admin-text-slate-700 admin-whitespace-pre-wrap">{note.message}</p>
              <p className="admin-note-meta">
                {note.authorEmail} · {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="admin-flex admin-gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add an internal note…"
            className="admin-input admin-flex-1"
          />
          <button
            onClick={addNote}
            disabled={savingNote || !noteText.trim()}
            className="admin-btn admin-btn--primary"
          >
            Add
          </button>
        </div>
      </section>
    </div>
  );
}