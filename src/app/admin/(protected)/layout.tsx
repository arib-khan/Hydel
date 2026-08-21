// src/app/admin/(protected)/layout.tsx
//
// Real authorization boundary for every actual admin page (dashboard,
// products, inquiries, users, MFA enrollment). Verifies the session cookie
// and admin/superadmin custom claim server-side via requireAdminSession()
// - this is enforced again independently by every /api/admin/* route, so a
// bug here can never be the only thing standing between a visitor and admin
// data.
import { redirect } from 'next/navigation';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import AdminShell from './AdminShell';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireAdminSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect('/admin/login');
    }
    throw err;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}