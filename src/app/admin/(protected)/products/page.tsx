// src/app/admin/(protected)/products/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiBox } from 'react-icons/fi';
import { MdSwapVert } from 'react-icons/md';
import type { Product } from '@/types/product';
import { useAdminUI } from '../ui/AdminUI';

export default function AdminProductsPage() {
  const { toast, confirm } = useAdminUI();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'position'>('position');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('sortBy', sortBy);
      params.set('sortDir', sortBy === 'position' || sortBy === 'name' ? 'asc' : 'desc');
      if (includeDeleted) params.set('includeDeleted', 'true');

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load products');
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, includeDeleted]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleDelete(product: Product) {
    const ok = await confirm({
      title: `Remove “${product.name}”?`,
      message: 'It will be hidden from the public site. You can restore it later.',
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast(`“${product.name}” removed from the site.`, 'success', 'Removed');
      load();
    } else {
      toast('Could not remove the product. Please try again.', 'error');
    }
  }

  async function handleRestore(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}/restore`, { method: 'POST' });
    if (res.ok) {
      toast(`“${product.name}” is live again.`, 'success', 'Restored');
      load();
    } else {
      toast('Could not restore the product (Super Admin only).', 'error');
    }
  }

  return (
    <div className="admin-space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-heading">Products</h1>
          <p className="admin-subheading">Manage your product catalog.</p>
        </div>
        <div className="admin-flex admin-gap-3">
          <Link href="/admin/products/reorder" className="admin-btn admin-btn--outline">
            <MdSwapVert className="admin-btn-icon" aria-hidden /> Reorder
          </Link>
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
            <FiPlus className="admin-btn-icon" aria-hidden /> Add Product
          </Link>
        </div>
      </div>

      <div className="admin-flex admin-flex--wrap admin-gap-3 admin-items-center">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input admin-w-64"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="admin-select"
        >
          <option value="position">Storefront order</option>
          <option value="updatedAt">Recently updated</option>
          <option value="createdAt">Recently created</option>
          <option value="name">Name</option>
        </select>
        <label className="admin-flex admin-items-center admin-gap-2 admin-text-sm admin-text-slate">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="admin-checkbox"
          />
          Show removed products
        </label>
      </div>

      {error && <p className="admin-text-sm admin-text-red">{error}</p>}

      {loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Material</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="admin-flex admin-items-center admin-gap-3">
                      <span className="admin-skeleton admin-skeleton--thumb" />
                      <span className="admin-skeleton admin-skeleton--line" style={{ width: '9rem' }} />
                    </div>
                  </td>
                  <td><span className="admin-skeleton admin-skeleton--text" style={{ width: '5rem' }} /></td>
                  <td><span className="admin-skeleton admin-skeleton--pill" /></td>
                  <td><span className="admin-skeleton admin-skeleton--text" style={{ width: '4rem' }} /></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-empty">
            <span className="admin-empty__icon">
              <FiBox />
            </span>
            <p className="admin-empty__title">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
            <p className="admin-empty__text">
              {search
                ? 'Try a different name, material, or description.'
                : 'Add your first product to show it on the public site.'}
            </p>
            {!search && (
              <Link href="/admin/products/new" className="admin-btn admin-btn--primary admin-mt-2">
                <FiPlus className="admin-btn-icon" aria-hidden /> Add Product
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Material</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.deleted ? 'admin-opacity-50' : ''}>
                  <td>
                    <div className="admin-flex admin-items-center admin-gap-3">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="admin-rounded admin-object-cover admin-w-10 admin-h-10"
                          unoptimized
                        />
                      )}
                      <div>
                        <p className="admin-font-medium admin-text-slate-800">{p.name}</p>
                        <p className="admin-text-xs admin-text-muted">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="admin-text-slate">{p.material}</td>
                  <td>
                    {p.deleted ? (
                      <span className="admin-badge admin-badge--removed">Removed</span>
                    ) : (
                      <span className="admin-badge admin-badge--live">Live</span>
                    )}
                  </td>
                  <td className="admin-text-muted">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="admin-text-right admin-whitespace-nowrap admin-space-x-3">
                    {!p.deleted && (
                      <Link href={`/admin/products/${p.id}/edit`} className="admin-btn admin-btn--blue-outline admin-btn--sm">
                        Edit
                      </Link>
                    )}
                    {p.deleted ? (
                      <button onClick={() => handleRestore(p)} className="admin-btn admin-btn--green-outline admin-btn--sm">
                        Restore
                      </button>
                    ) : (
                      <button onClick={() => handleDelete(p)} className="admin-btn admin-btn--danger admin-btn--sm">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
