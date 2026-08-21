// src/app/admin/(protected)/carousel/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MdDragIndicator } from 'react-icons/md';
import {
  FiChevronUp,
  FiChevronDown,
  FiInfo,
  FiTrash2,
  FiUploadCloud,
  FiPlay,
  FiExternalLink,
} from 'react-icons/fi';
import Link from 'next/link';
import type { CarouselSlide } from '@/types/carousel';
import { useAdminUI } from '../ui/AdminUI';

export default function CarouselManagerPage() {
  const { toast, confirm } = useAdminUI();

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reorder state (mirrors the product reorder page).
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Draft (new slide) state.
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftPreview, setDraftPreview] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<'image' | 'video' | null>(null);
  const [draftAlt, setDraftAlt] = useState('');
  const [adding, setAdding] = useState(false);

  // Inline alt-text edits, keyed by slide id.
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});

  // Revoke the object URL whenever the preview changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (draftPreview) URL.revokeObjectURL(draftPreview);
    };
  }, [draftPreview]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/carousel');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load carousel');
        if (!cancelled) setSlides(data.slides);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load carousel');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function onFileSelected(file: File | undefined) {
    if (!file) return;
    const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
    setDraftFile(file);
    setDraftType(type);
    setDraftPreview(URL.createObjectURL(file)); // effect revokes the previous one
  }

  function clearDraft() {
    setDraftFile(null);
    setDraftType(null);
    setDraftPreview(null); // effect revokes the object URL
    setDraftAlt('');
  }

  async function uploadToCloudinary(file: File, type: 'image' | 'video') {
    const signRes = await fetch('/api/admin/upload/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'carousel' }),
    });
    const sign = await signRes.json();
    if (!signRes.ok) throw new Error(sign.error || 'Failed to prepare upload');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sign.apiKey);
    formData.append('timestamp', String(sign.timestamp));
    formData.append('signature', sign.signature);
    formData.append('folder', sign.folder);

    // resource_type lives in the URL, so the same signature works for both.
    const endpoint = type === 'video' ? 'video' : 'image';
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/${endpoint}/upload`,
      { method: 'POST', body: formData }
    );
    const uploaded = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploaded.error?.message || 'Media upload failed');

    return { src: uploaded.secure_url as string, publicId: uploaded.public_id as string };
  }

  async function handleAdd() {
    if (!draftFile || !draftType) return;
    setAdding(true);
    try {
      const { src, publicId } = await uploadToCloudinary(draftFile, draftType);
      const res = await fetch('/api/admin/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: draftType,
          src,
          publicId,
          alt: draftAlt.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add slide');
      setSlides((prev) => [...prev, data.slide]);
      clearDraft();
      toast('Slide added to the carousel.', 'success', 'Slide added');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to add slide', 'error', 'Upload failed');
    } finally {
      setAdding(false);
    }
  }

  async function saveAlt(slide: CarouselSlide) {
    const draft = altDrafts[slide.id];
    if (draft === undefined || draft === slide.alt) return;
    try {
      const res = await fetch(`/api/admin/carousel/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update slide');
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, alt: draft } : s)));
      setAltDrafts((prev) => {
        const next = { ...prev };
        delete next[slide.id];
        return next;
      });
      toast('Slide label updated.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update slide', 'error');
    }
  }

  async function handleDelete(slide: CarouselSlide) {
    const ok = await confirm({
      title: 'Remove this slide?',
      message:
        'It will no longer appear in the homepage carousel, and the uploaded media will be deleted.',
      tone: 'danger',
      confirmLabel: 'Remove slide',
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/carousel/${slide.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove slide');
      setSlides((prev) => prev.filter((s) => s.id !== slide.id));
      toast('Slide removed.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to remove slide', 'error');
    }
  }

  const move = useCallback((from: number, to: number) => {
    if (to < 0) return;
    setSlides((prev) => {
      if (from === to || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDirty(true);
  }, []);

  function handleDrop(dropIdx: number) {
    const from = dragIndex.current;
    if (from !== null && from !== dropIdx) move(from, dropIdx);
    dragIndex.current = null;
    setOverIndex(null);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/admin/carousel/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: slides.map((s) => s.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save order');
      setDirty(false);
      toast('Carousel order saved. The homepage updates within a minute.', 'success', 'Order saved');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save order', 'error', 'Could not save');
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className="admin-space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-heading">Homepage Carousel</h1>
          <p className="admin-subheading">
            Manage the hero slideshow shown at the top of the public homepage.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-btn admin-btn--outline"
        >
          <FiExternalLink size={15} aria-hidden /> View homepage
        </a>
      </div>

      {/* Add a new slide */}
      <section className="admin-card admin-space-y-4">
        <h2 className="admin-card-title">Add a slide</h2>

        {!draftFile ? (
          <label className="admin-dropzone">
            <FiUploadCloud aria-hidden />
            <span className="admin-block admin-text-slate-700">
              Click to upload an image or video
            </span>
            <span className="admin-text-sm admin-text-muted">
              JPG, PNG, WebP, or MP4 — landscape works best
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              className="admin-hidden"
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />
          </label>
        ) : (
          <div className="admin-space-y-4">
            <div className="admin-slide-item" style={{ cursor: 'default' }}>
              <div className="admin-slide-preview">
                {draftType === 'video' ? (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={draftPreview ?? undefined} muted playsInline preload="metadata" />
                    <span className="admin-slide-play-badge">
                      <FiPlay aria-hidden />
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draftPreview ?? undefined} alt="New slide preview" />
                )}
              </div>
              <div className="admin-slide-body admin-space-y-2">
                <span className={`admin-badge admin-badge--${draftType}`}>{draftType}</span>
                <div>
                  <label className="admin-label" htmlFor="draft-alt">
                    Label / alt text (optional)
                  </label>
                  <input
                    id="draft-alt"
                    className="admin-input"
                    placeholder="e.g. Spiral wound gaskets in production"
                    value={draftAlt}
                    onChange={(e) => setDraftAlt(e.target.value)}
                    maxLength={200}
                  />
                </div>
              </div>
            </div>
            <div className="admin-flex admin-gap-3">
              <button
                type="button"
                className="admin-btn admin-btn--brand"
                onClick={handleAdd}
                disabled={adding}
              >
                {adding ? 'Uploading…' : 'Add to carousel'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={clearDraft}
                disabled={adding}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="admin-reorder-hint">
        <FiInfo size={16} aria-hidden />
        The top slide shows first on the homepage. Drag the handle, or use the arrows, then save the
        order.
      </div>

      {error && <p className="admin-text-sm admin-text-red">{error}</p>}

      {loading ? (
        <ul className="admin-slide-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="admin-slide-item" style={{ cursor: 'default' }}>
              <span className="admin-skeleton admin-skeleton--thumb" style={{ width: '8rem', height: '4.5rem' }} />
              <span className="admin-skeleton admin-skeleton--line" style={{ flex: 1, maxWidth: '16rem' }} />
            </li>
          ))}
        </ul>
      ) : slides.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__icon">
            <FiUploadCloud />
          </span>
          <p className="admin-empty__title">No slides yet</p>
          <p className="admin-empty__text">
            The homepage is showing the built-in default slides. Upload an image or video above to
            take over the carousel.
          </p>
        </div>
      ) : (
        <ul className="admin-slide-list">
          {slides.map((slide, index) => (
            <li
              key={slide.id}
              className={`admin-slide-item ${overIndex === index ? 'drag-over' : ''}`}
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIndex !== index) setOverIndex(index);
              }}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                dragIndex.current = null;
                setOverIndex(null);
              }}
            >
              <span className="admin-drag-handle" aria-hidden title="Drag to reorder">
                <MdDragIndicator />
              </span>

              <div className="admin-slide-preview">
                {slide.type === 'video' ? (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={slide.src} muted playsInline preload="metadata" />
                    <span className="admin-slide-play-badge">
                      <FiPlay aria-hidden />
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.src} alt={slide.alt || 'Carousel slide'} />
                )}
              </div>

              <div className="admin-slide-body admin-space-y-2">
                <span className={`admin-badge admin-badge--${slide.type}`}>{slide.type}</span>
                <input
                  className="admin-input"
                  placeholder="Label / alt text (optional)"
                  value={altDrafts[slide.id] ?? slide.alt}
                  onChange={(e) =>
                    setAltDrafts((prev) => ({ ...prev, [slide.id]: e.target.value }))
                  }
                  onBlur={() => saveAlt(slide)}
                  maxLength={200}
                />
              </div>

              <div className="admin-slide-actions">
                <div className="admin-reorder-move">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move slide up"
                  >
                    <FiChevronUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === slides.length - 1}
                    aria-label="Move slide down"
                  >
                    <FiChevronDown />
                  </button>
                </div>
                <button
                  type="button"
                  className="admin-btn-icon"
                  onClick={() => handleDelete(slide)}
                  aria-label="Remove slide"
                  title="Remove slide"
                >
                  <FiTrash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && dirty && (
        <div className="admin-sticky-actions">
          <button
            type="button"
            className="admin-btn admin-btn--brand"
            onClick={handleSaveOrder}
            disabled={savingOrder}
          >
            {savingOrder ? 'Saving…' : 'Save order'}
          </button>
          <span className="admin-text-sm admin-text-muted">Unsaved order changes</span>
        </div>
      )}
    </div>
  );
}
