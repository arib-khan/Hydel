// src/app/components/PublicChrome.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './index';
import Footer, { FooterProductLink } from './Footer/Footer';

/**
 * Keeps the public site's Navbar/Footer exactly as they were, while
 * completely excluding them from /admin routes so the admin panel is
 * visually independent from the public website (per project requirements).
 *
 * `footerProducts` is fetched server-side in layout.tsx (this component is
 * a client component, so it can't fetch Firestore data itself) and passed
 * straight through to the Footer so its product list stays in sync with the
 * real catalog.
 */
export default function PublicChrome({
  children,
  footerProducts = [],
}: {
  children: React.ReactNode;
  footerProducts?: FooterProductLink[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer products={footerProducts} />
    </>
  );
}