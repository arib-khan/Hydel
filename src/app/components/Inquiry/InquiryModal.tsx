// src/app/components/Inquiry/InquiryModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './InquiryModal.module.css';

interface InquiryModalProps {
  productId: string;
  productName: string;
  productSlug?: string;
  open: boolean;
  onClose: () => void;
}

interface FormState {
  customerName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  quantity: string;
  additionalRequirements: string;
  website: string; // honeypot
}

const initialState: FormState = {
  customerName: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  quantity: '',
  additionalRequirements: '',
  website: '',
};

export default function InquiryModal({ productId, productName, productSlug, open, onClose }: InquiryModalProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.customerName.trim().length < 2) next.customerName = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Please enter a valid email';
    if (form.phone.trim().length < 7) next.phone = 'Please enter a valid phone number';
    if (form.message.trim().length < 5) next.message = 'Please add a short message';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          productSlug,
          ...form,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setForm(initialState);
    setErrors({});
    setSubmitError(null);
    setSuccess(false);
    onClose();
  }

  // Rendered via a portal straight into document.body instead of in place.
  // ProductCard wraps the whole card (including this modal's trigger) in a
  // Next.js <Link>, and this modal previously rendered as a DOM descendant
  // of that <a> - clicking the overlay backdrop (or anything else not
  // explicitly guarded with stopPropagation) would bubble up and trigger
  // the card's own navigation instead of just closing the modal. A portal
  // sidesteps that whole class of bug entirely, and also avoids nesting
  // interactive form elements inside an <a>, which is invalid HTML.
  const modal = (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
          ✕
        </button>

        {success ? (
          <div className={styles.successState}>
            <h3>Thank you!</h3>
            <p>Your inquiry about <strong>{productName}</strong> has been received. Our team will get back to you shortly.</p>
          </div>
        ) : (
          <>
            <h2 className={styles.title}>Inquire About This Product</h2>
            <p className={styles.subtitle}>{productName}</p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className={styles.honeypot}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="customerName">Name *</label>
                  <input
                    id="customerName"
                    value={form.customerName}
                    onChange={(e) => update('customerName', e.target.value)}
                  />
                  {errors.customerName && <p className={styles.error}>{errors.customerName}</p>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="company">Company</label>
                  <input id="company" value={form.company} onChange={(e) => update('company', e.target.value)} />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                  {errors.email && <p className={styles.error}>{errors.email}</p>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Phone / WhatsApp *</label>
                  <input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                  {errors.phone && <p className={styles.error}>{errors.phone}</p>}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  placeholder="e.g. 200 units"
                  value={form.quantity}
                  onChange={(e) => update('quantity', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                />
                {errors.message && <p className={styles.error}>{errors.message}</p>}
              </div>

              <div className={styles.field}>
                <label htmlFor="additionalRequirements">Additional Requirements</label>
                <textarea
                  id="additionalRequirements"
                  rows={2}
                  value={form.additionalRequirements}
                  onChange={(e) => update('additionalRequirements', e.target.value)}
                />
              </div>

              {submitError && <p className={styles.statusError}>{submitError}</p>}

              <button type="submit" className={styles.submitButton} disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}