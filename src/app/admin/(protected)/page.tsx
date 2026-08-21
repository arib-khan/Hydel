// src/app/admin/(protected)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import { FiBox, FiInbox, FiMail, FiClock } from 'react-icons/fi';
import type { Inquiry } from '@/types/inquiry';
import type { Product } from '@/types/product';

interface DashboardData {
  products: { total: number; deleted: number };
  inquiries: { total: number; new: number; inProgress: number; contacted: number; closed: number };
  recentInquiries: Inquiry[];
  recentProducts: Product[];
}

type StatTone = 'brand' | 'blue' | 'amber' | 'slate';

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  tone = 'slate',
}: {
  label: string;
  value: number | string;
  href?: string;
  icon: IconType;
  tone?: StatTone;
}) {
  const className = `admin-stat admin-stat--${tone}`;
  const inner = (
    <>
      <span className="admin-stat__icon">
        <Icon aria-hidden />
      </span>
      <div>
        <p className="admin-stat__label">{label}</p>
        <p className="admin-stat__value">{value}</p>
      </div>
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="admin-space-y-8">
      <div>
        <h1 className="admin-heading">Dashboard</h1>
        <p className="admin-subheading">Overview of your catalog and customer inquiries.</p>
      </div>
      <div className="admin-grid-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-stat admin-stat--slate">
            <span className="admin-skeleton admin-skeleton--thumb" />
            <div style={{ flex: 1 }}>
              <span className="admin-skeleton admin-skeleton--text" style={{ width: '60%' }} />
              <span
                className="admin-skeleton admin-skeleton--line"
                style={{ width: '2.5rem', marginTop: '0.4rem' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="admin-grid-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <section key={i} className="admin-card admin-space-y-3">
            <span className="admin-skeleton admin-skeleton--line" style={{ width: '40%' }} />
            {Array.from({ length: 4 }).map((__, j) => (
              <span key={j} className="admin-skeleton admin-skeleton--text" style={{ width: '100%' }} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load dashboard');
        return json;
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="admin-text-sm admin-text-red">{error}</p>;
  if (!data) return <DashboardSkeleton />;

  return (
    <div className="admin-space-y-8">
      <div>
        <h1 className="admin-heading">Dashboard</h1>
        <p className="admin-subheading">Overview of your catalog and customer inquiries.</p>
      </div>

      <div className="admin-grid-4">
        <StatCard
          label="Total Products"
          value={data.products.total}
          href="/admin/products"
          icon={FiBox}
          tone="brand"
        />
        <StatCard
          label="Total Inquiries"
          value={data.inquiries.total}
          href="/admin/inquiries"
          icon={FiInbox}
          tone="blue"
        />
        <StatCard
          label="New Inquiries"
          value={data.inquiries.new}
          href="/admin/inquiries?status=new"
          icon={FiMail}
          tone="amber"
        />
        <StatCard
          label="In Progress"
          value={data.inquiries.inProgress}
          href="/admin/inquiries?status=in_progress"
          icon={FiClock}
          tone="slate"
        />
      </div>

      <div className="admin-grid-2">
        <section className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="admin-text-sm admin-text-blue">View all</Link>
          </div>
          {data.recentInquiries.length === 0 && <p className="admin-text-sm admin-text-muted">No inquiries yet.</p>}
          <ul className="admin-list-divide">
            {data.recentInquiries.map((inq) => (
              <li key={inq.id} className="admin-py-2">
                <Link href={`/admin/inquiries/${inq.id}`} className="admin-block admin--mx-2 admin-px-2 admin-py-1 admin-rounded hover:admin-bg-slate-50">
                  <p className="admin-text-sm admin-font-medium admin-text-slate-800">
                    {inq.customerName} — {inq.productName}
                  </p>
                  <p className="admin-text-xs admin-text-muted">
                    {new Date(inq.createdAt).toLocaleString()} · {inq.status.replace('_', ' ')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recently Added Products</h2>
            <Link href="/admin/products" className="admin-text-sm admin-text-blue">View all</Link>
          </div>
          {data.recentProducts.length === 0 && <p className="admin-text-sm admin-text-muted">No products yet.</p>}
          <ul className="admin-list-divide">
            {data.recentProducts.map((p) => (
              <li key={p.id} className="admin-py-2">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="admin-block admin--mx-2 admin-px-2 admin-py-1 admin-rounded hover:admin-bg-slate-50"
                >
                  <p className="admin-text-sm admin-font-medium admin-text-slate-800">{p.name}</p>
                  <p className="admin-text-xs admin-text-muted">{p.material}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
