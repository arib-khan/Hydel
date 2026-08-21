// src/app/admin/(protected)/users/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AdminUser, AdminRole } from '@/types/admin';
import { useAdminUI } from '../ui/AdminUI';

export default function AdminUsersPage() {
  const { toast } = useAdminUI();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [creating, setCreating] = useState(false);
  const [createdCredential, setCreatedCredential] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load admins');
      setAdmins(data.admins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setCreatedCredential(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName: displayName || undefined, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setCreatedCredential({ email, password: data.temporaryPassword });
      setEmail('');
      setDisplayName('');
      setRole('admin');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  }

  async function toggleDisabled(admin: AdminUser) {
    const res = await fetch(`/api/admin/users/${admin.uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: !admin.disabled }),
    });
    if (res.ok) {
      toast(`${admin.email} ${admin.disabled ? 'enabled' : 'disabled'}.`, 'success');
      load();
    } else {
      toast('Failed to update admin status.', 'error');
    }
  }

  async function changeRole(admin: AdminUser, newRole: AdminRole) {
    const res = await fetch(`/api/admin/users/${admin.uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast(`Role updated to ${newRole === 'superadmin' ? 'Super Admin' : 'Admin'}.`, 'success');
      load();
    } else {
      toast('Failed to update admin role.', 'error');
    }
  }

  return (
    <div className="admin-space-y-8 admin-max-w-3xl">
      <div>
        <h1 className="admin-heading">Admin Users</h1>
        <p className="admin-subheading">
          Super Admin only. Each admin gets their own account, password, and authenticator app enrollment —
          there is no shared login.
        </p>
      </div>

      {error && <p className="admin-text-sm admin-text-red">{error}</p>}

      <section className="admin-card">
        <h2 className="admin-card-title admin-mb-3">Add Admin</h2>
        <form onSubmit={handleCreate} className="admin-flex admin-flex--wrap admin-gap-3 admin-items-end">
          <div>
            <label className="admin-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input admin-w-64"
            />
          </div>
          <div>
            <label className="admin-label">Name (optional)</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="admin-input admin-w-48"
            />
          </div>
          <div>
            <label className="admin-label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="admin-select"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="admin-btn admin-btn--primary"
          >
            {creating ? 'Creating…' : 'Create Admin'}
          </button>
        </form>

        {createdCredential && (
          <div className="admin-mt-4 admin-bg-amber-50 admin-border admin-rounded admin-p-3 admin-text-sm admin-text-amber">
            <p className="admin-font-medium">Share this temporary password securely — it is shown only once:</p>
            <p className="admin-mt-1">
              <strong>{createdCredential.email}</strong> — <code>{createdCredential.password}</code>
            </p>
            <p className="admin-text-xs admin-mt-2 admin-text-amber-700">
              This admin must sign in and enroll their authenticator app before accessing the rest of the panel.
            </p>
          </div>
        )}
      </section>

      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Admin</th>
              <th>Role</th>
              <th>2FA</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="admin-text-center admin-py-6 admin-text-muted">Loading…</td>
              </tr>
            )}
            {!loading &&
              admins.map((admin) => (
                <tr key={admin.uid}>
                  <td>
                    <p className="admin-font-medium admin-text-slate-800">{admin.displayName || admin.email}</p>
                    <p className="admin-text-xs admin-text-muted">{admin.email}</p>
                  </td>
                  <td>
                    <select
                      value={admin.role}
                      onChange={(e) => changeRole(admin, e.target.value as AdminRole)}
                      className="admin-select admin-text-xs admin-py-1 admin-px-2"
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>
                  <td>
                    {admin.mfaEnrolled ? (
                      <span className="admin-badge admin-badge--enrolled">Enrolled</span>
                    ) : (
                      <span className="admin-badge admin-badge--not-enrolled">Not set up</span>
                    )}
                  </td>
                  <td>
                    {admin.disabled ? (
                      <span className="admin-badge admin-badge--disabled">Disabled</span>
                    ) : (
                      <span className="admin-badge admin-badge--active">Active</span>
                    )}
                  </td>
                  <td className="admin-text-right">
                    <button onClick={() => toggleDisabled(admin)} className="admin-btn admin-btn--blue-outline admin-btn--sm">
                      {admin.disabled ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-text-center admin-py-6 admin-text-muted">No admins found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}