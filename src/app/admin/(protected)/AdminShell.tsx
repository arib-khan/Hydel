// src/app/admin/(protected)/AdminShell.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { IconType } from 'react-icons';
import {
  FiGrid,
  FiBox,
  FiImage,
  FiInbox,
  FiUsers,
  FiShield,
  FiLogOut,
  FiExternalLink,
} from 'react-icons/fi';
import type { AdminSessionUser } from '@/lib/auth/session';
import { AdminUIProvider } from './ui/AdminUI';

interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  exact?: boolean;
  superAdminOnly?: boolean;
}

interface NavSection {
  label: string | null;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: null,
    items: [{ href: '/admin', label: 'Dashboard', icon: FiGrid, exact: true }],
  },
  {
    label: 'Manage',
    items: [
      { href: '/admin/products', label: 'Products', icon: FiBox },
      { href: '/admin/carousel', label: 'Homepage Carousel', icon: FiImage },
      { href: '/admin/inquiries', label: 'Inquiries', icon: FiInbox },
    ],
  },
  {
    label: 'Settings',
    items: [{ href: '/admin/users', label: 'Admin Users', icon: FiUsers, superAdminOnly: true }],
  },
];

export default function AdminShell({
  user,
  children,
}: {
  user: AdminSessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mfaEnrolled, setMfaEnrolled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setMfaEnrolled(data.mfaEnrolled);
        if (!data.mfaEnrolled && pathname !== '/admin/mfa/enroll') {
          router.push('/admin/mfa/enroll');
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Re-check whenever the route changes, e.g. right after enrollment completes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  const showEnrollBanner = mfaEnrolled === false && pathname !== '/admin/mfa/enroll';

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname?.startsWith(item.href);
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-brand-mark" aria-hidden>
              H
            </span>
            <p className="admin-sidebar-title">Hydel Admin</p>
          </div>
          <p className="admin-sidebar-email">{user.email}</p>
          <span className="admin-sidebar-role">
            {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_SECTIONS.map((section, si) => {
            const items = section.items.filter(
              (item) => !item.superAdminOnly || user.role === 'superadmin'
            );
            if (items.length === 0) return null;
            return (
              <div key={si}>
                {section.label && <p className="admin-sidebar-section-label">{section.label}</p>}
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`admin-sidebar-link ${isActive(item) ? 'active' : ''}`}
                      aria-current={isActive(item) ? 'page' : undefined}
                    >
                      <Icon className="admin-sidebar-icon" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/admin/mfa/enroll" className="admin-sidebar-link">
            <FiShield className="admin-sidebar-icon" aria-hidden />
            Manage 2FA
          </Link>
          <button onClick={handleLogout} className="admin-sidebar-link admin-text-left">
            <FiLogOut className="admin-sidebar-icon" aria-hidden />
            Sign out
          </button>
          <Link href="/" className="admin-sidebar-link admin-sidebar-link--back">
            <FiExternalLink className="admin-sidebar-icon" aria-hidden />
            Back to website
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        {showEnrollBanner && (
          <div className="admin-banner">
            Two-factor authentication isn&apos;t set up on your account yet.{' '}
            <Link href="/admin/mfa/enroll">Enroll your authenticator app now</Link>.
          </div>
        )}
        <main className="admin-content">
          <AdminUIProvider>{children}</AdminUIProvider>
        </main>
      </div>
    </div>
  );
}
