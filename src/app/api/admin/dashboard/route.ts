// src/app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { requireAdminSession, UnauthorizedError } from '@/lib/auth/session';
import { countProducts, listAdminProducts } from '@/lib/repositories/productRepository';
import { getInquiryStats, getRecentInquiries } from '@/lib/repositories/inquiryRepository';

export async function GET() {
  try {
    await requireAdminSession();

    const [productCounts, inquiryStats, recentInquiries, recentProducts] = await Promise.all([
      countProducts(),
      getInquiryStats(),
      getRecentInquiries(5),
      listAdminProducts({ sortBy: 'createdAt', sortDir: 'desc' }),
    ]);

    return NextResponse.json({
      products: productCounts,
      inquiries: inquiryStats,
      recentInquiries,
      recentProducts: recentProducts.slice(0, 5),
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[admin dashboard] failed to load stats', err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
