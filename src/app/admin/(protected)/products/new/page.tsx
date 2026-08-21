// src/app/admin/(protected)/products/new/page.tsx
import ProductForm from '../ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="admin-heading admin-mb-1">Add Product</h1>
      <p className="admin-subheading admin-mb-6">Create a new product for the public catalog.</p>
      <ProductForm />
    </div>
  );
}