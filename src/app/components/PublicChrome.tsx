// src/app/components/PublicChrome.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './index';
import Footer from './Footer/Footer';

/**
 * Keeps the public site's Navbar/Footer exactly as they were, while
 * completely excluding them from /admin routes so the admin panel is
 * visually independent from the public website (per project requirements).
 */
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
