// src/app/admin/(protected)/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { getAdminProductById } from '@/lib/repositories/productRepository';
import ProductForm from '../../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getAdminProductById(id);

  if (!product) notFound();

  return (
    <div>
      <h1 className="admin-heading admin-mb-1">Edit Product</h1>
      <p className="admin-subheading admin-mb-6">{product.name}</p>
      <ProductForm product={product} />
    </div>
  );
}