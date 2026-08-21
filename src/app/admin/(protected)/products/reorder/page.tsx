// src/app/admin/(protected)/products/reorder/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MdDragIndicator } from 'react-icons/md';
import { FiChevronUp, FiChevronDown, FiArrowLeft, FiInfo } from 'react-icons/fi';
import type { Product } from '@/types/product';
import { useAdminUI } from '../../ui/AdminUI';

export default function ReorderProductsPage() {
  const router = useRouter();
  const { toast } = useAdminUI();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/products?sortBy=position&sortDir=asc');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load products');
        if (!cancelled) setItems(data.products);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const move = useCallback((from: number, to: number) => {
    if (to < 0) return;
    setItems((prev) => {
      if (from === to || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDirty(true);
  }, []);

  function handleDrop(dropIdx: number) {
    const from = dragIndex.current;
    if (from !== null && from !== dropIdx) move(from, dropIdx);
    dragIndex.current = null;
    setOverIndex(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: items.map((p) => p.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save order');
      setDirty(false);
      toast('Product order saved. The storefront updates within a minute.', 'success', 'Order saved');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save order';
      setError(message);
      toast(message, 'error', 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-space-y-6">
      <div>
        <Link href="/admin/products" className="admin-back-link">
          <FiArrowLeft size={15} aria-hidden /> Back to products
        </Link>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-heading">Reorder products</h1>
            <p className="admin-subheading">
              Drag products into the order they should appear on the public Products page.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-reorder-hint">
        <FiInfo size={16} aria-hidden />
        The top item shows first at <strong>/products</strong>. Drag the handle, or use the arrows,
        then save.
      </div>

      {error && <p className="admin-text-sm admin-text-red">{error}</p>}

      {loading ? (
        <ul className="admin-reorder-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="admin-reorder-item" style={{ cursor: 'default' }}>
              <span className="admin-skeleton admin-skeleton--text" style={{ width: '1.2rem' }} />
              <span className="admin-skeleton admin-skeleton--thumb" />
              <span className="admin-skeleton admin-skeleton--line" style={{ flex: 1, maxWidth: '14rem' }} />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__icon">
            <MdDragIndicator />
          </span>
          <p className="admin-empty__title">No products to reorder yet</p>
          <p className="admin-empty__text">
            Add products first, then come back to arrange how they appear on the storefront.
          </p>
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary admin-mt-2">
            + Add Product
          </Link>
        </div>
      ) : (
        <ul className="admin-reorder-list">
          {items.map((p, index) => (
            <li
              key={p.id}
              className={`admin-reorder-item ${overIndex === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== index) setOverIndex(index);
              }}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                dragIndex.current = null;
                setOverIndex(null);
              }}
            >
              <span className="admin-reorder-index">{index + 1}</span>
              <span className="admin-drag-handle" aria-hidden title="Drag to reorder">
                <MdDragIndicator />
              </span>
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  width={44}
                  height={44}
                  className="admin-reorder-thumb"
                  unoptimized
                />
              ) : (
                <span className="admin-reorder-thumb" />
              )}
              <div className="admin-reorder-item__body">
                <p className="admin-reorder-item__name">{p.name}</p>
                <p className="admin-reorder-item__meta">{p.material}</p>
              </div>
              <div className="admin-reorder-move">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${p.name} up`}
                >
                  <FiChevronUp />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${p.name} down`}
                >
                  <FiChevronDown />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && items.length > 0 && (
        <div className="admin-sticky-actions">
          <button
            type="button"
            className="admin-btn admin-btn--brand"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? 'Saving…' : 'Save order'}
          </button>
          <Link href="/admin/products" className="admin-btn admin-btn--outline">
            {dirty ? 'Discard' : 'Done'}
          </Link>
          {dirty && <span className="admin-text-sm admin-text-muted">Unsaved changes</span>}
        </div>
      )}
    </div>
  );
}
