// src/app/admin/(protected)/products/ProductForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, ProductTechnical } from '@/types/product';

type FormValues = {
  name: string;
  description: string;
  fullDescription: string;
  price: string;
  material: string;
  customizable: boolean;
  colors: string; // comma-separated in the UI
  sizes: string;
  temperatureRange: string;
  pressureRating: string;
  applications: string;
  features: string;
  standards: string;
  compliance: string;
  image: string;
  imagePublicId: string;
};

function toCsv(arr?: string[]) {
  return (arr || []).join(', ');
}
function fromCsv(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [values, setValues] = useState<FormValues>({
    name: product?.name || '',
    description: product?.description || '',
    fullDescription: product?.fullDescription || '',
    price: product?.price?.toString() || '',
    material: product?.material || '',
    customizable: product?.customizable ?? false,
    colors: toCsv(product?.colors),
    sizes: toCsv(product?.sizes),
    temperatureRange: product?.temperatureRange || '',
    pressureRating: product?.pressureRating || '',
    applications: toCsv(product?.applications),
    features: toCsv(product?.features),
    standards: toCsv(product?.standards),
    compliance: product?.compliance || '',
    image: product?.image || '',
    imagePublicId: product?.imagePublicId || '',
  });

  const [technical, setTechnical] = useState<{ key: string; value: string }[]>(
    product?.technical ? Object.entries(product.technical).map(([key, value]) => ({ key, value })) : []
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const signRes = await fetch('/api/admin/upload/sign', { method: 'POST' });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || 'Failed to prepare upload');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sign.apiKey);
      formData.append('timestamp', String(sign.timestamp));
      formData.append('signature', sign.signature);
      formData.append('folder', sign.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploaded = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploaded.error?.message || 'Image upload failed');

      update('image', uploaded.secure_url);
      update('imagePublicId', uploaded.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function addSpec() {
    setTechnical((prev) => [...prev, { key: '', value: '' }]);
  }
  function updateSpec(index: number, field: 'key' | 'value', value: string) {
    setTechnical((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)));
  }
  function removeSpec(index: number) {
    setTechnical((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.image) {
      setError('Please upload a product image.');
      return;
    }

    const technicalObj: ProductTechnical = {};
    for (const spec of technical) {
      if (spec.key.trim()) technicalObj[spec.key.trim()] = spec.value.trim();
    }

    const payload = {
      name: values.name,
      description: values.description,
      fullDescription: values.fullDescription || undefined,
      price: values.price ? Number(values.price) : undefined,
      image: values.image,
      imagePublicId: values.imagePublicId || undefined,
      material: values.material,
      customizable: values.customizable,
      colors: fromCsv(values.colors),
      sizes: fromCsv(values.sizes),
      temperatureRange: values.temperatureRange || undefined,
      pressureRating: values.pressureRating || undefined,
      applications: fromCsv(values.applications),
      features: fromCsv(values.features),
      standards: fromCsv(values.standards),
      compliance: values.compliance || undefined,
      technical: technicalObj,
    };

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-space-y-6 admin-max-w-3xl">
      {error && <p className="admin-text-sm admin-text-red admin-bg-red-50 admin-border admin-rounded admin-px-3 admin-py-2">{error}</p>}

      <section className="admin-card admin-space-y-4">
        <h2 className="admin-card-title">Basics</h2>

        <div>
          <label className="admin-label">Product Name *</label>
          <input
            required
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">Short Description *</label>
          <textarea
            required
            rows={2}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            className="admin-textarea"
          />
        </div>

        <div>
          <label className="admin-label">Full Description</label>
          <textarea
            rows={4}
            value={values.fullDescription}
            onChange={(e) => update('fullDescription', e.target.value)}
            className="admin-textarea"
          />
        </div>

        <div className="admin-grid-cols-2">
          <div>
            <label className="admin-label">Material *</label>
            <input
              required
              value={values.material}
              onChange={(e) => update('material', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Price</label>
            <input
              type="number"
              step="0.01"
              value={values.price}
              onChange={(e) => update('price', e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <label className="admin-flex admin-items-center admin-gap-2 admin-text-sm admin-text-slate-700">
          <input
            type="checkbox"
            checked={values.customizable}
            onChange={(e) => update('customizable', e.target.checked)}
            className="admin-checkbox"
          />
          Customizable
        </label>
      </section>

      <section className="admin-card admin-space-y-4">
        <h2 className="admin-card-title">Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
        {uploading && <p className="admin-text-sm admin-text-muted">Uploading…</p>}
        {values.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={values.image} alt="Product preview" className="admin-product-preview" />
        )}
      </section>

      <section className="admin-card admin-space-y-4">
        <h2 className="admin-card-title">Attributes</h2>
        <div className="admin-grid-cols-2">
          <div>
            <label className="admin-label">Colors (comma-separated)</label>
            <input
              value={values.colors}
              onChange={(e) => update('colors', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Sizes (comma-separated)</label>
            <input
              value={values.sizes}
              onChange={(e) => update('sizes', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Temperature Range</label>
            <input
              value={values.temperatureRange}
              onChange={(e) => update('temperatureRange', e.target.value)}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Pressure Rating</label>
            <input
              value={values.pressureRating}
              onChange={(e) => update('pressureRating', e.target.value)}
              className="admin-input"
            />
          </div>
        </div>
        <div>
          <label className="admin-label">Applications (comma-separated)</label>
          <input
            value={values.applications}
            onChange={(e) => update('applications', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Features (comma-separated)</label>
          <input
            value={values.features}
            onChange={(e) => update('features', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Standards (comma-separated)</label>
          <input
            value={values.standards}
            onChange={(e) => update('standards', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Compliance Note</label>
          <input
            value={values.compliance}
            onChange={(e) => update('compliance', e.target.value)}
            className="admin-input"
          />
        </div>
      </section>

      <section className="admin-card admin-space-y-3">
        <div className="admin-flex admin-flex--between">
          <h2 className="admin-card-title">Technical Specifications</h2>
          <button
            type="button"
            onClick={addSpec}
            className="admin-text-sm admin-text-blue admin-btn--blue-outline"
          >
            + Add Specification
          </button>
        </div>
        {technical.length === 0 && <p className="admin-text-sm admin-text-muted">No technical specs added yet.</p>}
        {technical.map((spec, i) => (
          <div key={i} className="admin-flex admin-gap-2 admin-items-center">
            <input
              placeholder="Specification Name (e.g. Thickness)"
              value={spec.key}
              onChange={(e) => updateSpec(i, 'key', e.target.value)}
              className="admin-input admin-flex-1"
            />
            <input
              placeholder="Specification Value (e.g. 0.8mm - 6.0mm)"
              value={spec.value}
              onChange={(e) => updateSpec(i, 'value', e.target.value)}
              className="admin-input admin-flex-1"
            />
            <button type="button" onClick={() => removeSpec(i)} className="admin-text-red admin-text-sm admin-px-2">
              Remove
            </button>
          </div>
        ))}
      </section>

      <div className="admin-flex admin-gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="admin-btn admin-btn--primary"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="admin-btn admin-btn--outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}