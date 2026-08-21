// src/app/components/Inquiry/InquireButton.tsx
'use client';

import { useState, ReactNode } from 'react';
import InquiryModal from './InquiryModal';

interface InquireButtonProps {
  productId: string;
  productName: string;
  productSlug?: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  title?: string;
}

/**
 * Drop-in replacement for the old "open WhatsApp" quote buttons. Renders
 * whatever trigger element the caller passes as children (so it can keep
 * matching the existing product-card / product-detail styling) and opens the
 * product-aware inquiry form instead of redirecting off-site.
 */
export default function InquireButton({
  productId,
  productName,
  productSlug,
  className,
  children,
  ariaLabel,
  title,
}: InquireButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        title={title}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </button>
      <InquiryModal
        productId={productId}
        productName={productName}
        productSlug={productSlug}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
