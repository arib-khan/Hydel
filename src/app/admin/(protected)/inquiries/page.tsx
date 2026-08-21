// src/app/admin/(protected)/inquiries/page.tsx
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Inquiry, InquiryStatus } from '@/types/inquiry';

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  contacted: 'Contacted',
  closed: 'Closed',
};

const STATUS_COLOR: Record<InquiryStatus, string> = {
  new: 'admin-badge--new',
  in_progress: 'admin-badge--in_progress',
  contacted: 'admin-badge--contacted',
  closed: 'admin-badge--closed',
};

function InquiriesList() {
  const searchParams = useSearchParams();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InquiryStatus | ''>((searchParams.get('status') as InquiryStatus) || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load inquiries');
      setInquiries(data.inquiries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="admin-space-y-6">
      <div>
        <h1 className="admin-heading">Inquiries</h1>
        <p className="admin-subheading">Customer inquiries submitted through product pages.</p>
      </div>

      <div className="admin-flex admin-flex--wrap admin-gap-3">
        <input
          type="text"
          placeholder="Search by name, email, company, product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input admin-w-80"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InquiryStatus | '')}
          className="admin-select"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error && <p className="admin-text-sm admin-text-red">{error}</p>}
      {loading && <p className="admin-text-sm admin-text-muted">Loading…</p>}

      {!loading && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Company</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>
                    <Link href={`/admin/inquiries/${inq.id}`} className="admin-block">
                      <p className="admin-font-medium admin-text-slate-800">{inq.customerName}</p>
                      <p className="admin-text-xs admin-text-muted">{inq.email}</p>
                    </Link>
                  </td>
                  <td className="admin-text-slate">{inq.productName}</td>
                  <td className="admin-text-slate">{inq.company || '—'}</td>
                  <td className="admin-text-muted">{new Date(inq.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge ${STATUS_COLOR[inq.status]}`}>
                      {STATUS_LABEL[inq.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-text-center admin-py-8 admin-text-muted">
                    No inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminInquiriesPage() {
  return (
    <Suspense fallback={<p className="admin-text-sm admin-text-muted">Loading…</p>}>
      <InquiriesList />
    </Suspense>
  );
}