// src/app/admin/layout.tsx
//
// Outer shell for the ENTIRE /admin tree (login, MFA enrollment, and the
// authenticated dashboard/products/inquiries/users pages). It deliberately
// does NOT render the public Navbar/Footer and does NOT perform the
// authenticated/role check itself – that happens one level down in
// src/app/admin/(protected)/layout.tsx so that /admin/login can render
// without redirect loops.
import './admin.css';

export const metadata = {
  title: 'Admin | Hydel',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}