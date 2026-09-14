// src/lib/seo/productSeo.ts
//
// Shared fallback logic for product SEO metadata. Every place that needs a
// meta title, meta description, keyword list, or image alt text for a
// product should go through these helpers so:
//   1. An admin-entered override (product.seo.*) always wins.
//   2. Every fallback is generated from the same rules, so the storefront
//      grid, product detail page, and admin preview never disagree.
//   3. No component has to duplicate "is there a custom value? else build
//      one from the name/material/description" logic.
//
// Deliberately has no 'server-only' import - it's pure string logic used by
// both server components (product detail page) and client components
// (ProductCard, RelatedProducts, ProductGallery, the admin form preview).

import type { Product } from '@/types/product';

const BRAND = 'Hydel Marketing & Services';
const SITE_NAME = 'Hydel';

type ProductForSeo = Pick<
    Product,
    'name' | 'material' | 'description' | 'fullDescription' | 'applications' | 'seo'
>;

/** Descriptive, non-generic alt text for a product's primary/gallery image. */
export function getProductImageAlt(product: ProductForSeo, variantLabel?: string): string {
    const custom = product.seo?.imageAltText?.trim();
    const base = custom || `${product.name} - ${product.material} manufactured by ${BRAND}`;
    return variantLabel ? `${base} (${variantLabel})` : base;
}

/** <title> for a product page. Falls back to "Name - Material | Brand". */
export function getProductMetaTitle(product: ProductForSeo): string {
    const custom = product.seo?.metaTitle?.trim();
    if (custom) return custom;
    return `${product.name} - ${product.material} | ${SITE_NAME} India`;
}

/**
 * Meta description for a product page, kept close to Google's ~155 char
 * display limit so it isn't truncated mid-sentence in search results.
 */
export function getProductMetaDescription(product: ProductForSeo): string {
    const custom = product.seo?.metaDescription?.trim();
    if (custom) return custom.length > 160 ? `${custom.slice(0, 159).trimEnd()}…` : custom;

    const CTA = ' ISO Certified. Request a quote today!';
    const baseText =
        product.fullDescription || product.description || `Premium ${product.name} made from ${product.material}.`;
    const maxBaseLength = 155 - CTA.length;
    const trimmedBase =
        baseText.length > maxBaseLength ? `${baseText.slice(0, maxBaseLength - 1).trimEnd()}…` : baseText;
    return `${trimmedBase}${CTA}`;
}

/** Meta/OG keyword list. Custom keywords are used as-is; otherwise generated from product data. */
export function getProductKeywords(product: ProductForSeo & { sizes?: string[]; temperatureRange?: string }): string[] {
    const custom = product.seo?.keywords;
    if (custom && custom.length > 0) return custom;

    return [
        product.name,
        `${product.name} price`,
        `buy ${product.name}`,
        `${product.name} supplier`,
        `${product.name} manufacturer`,
        product.material,
        `${product.material} gasket`,
        'industrial gaskets',
        'sealing solutions',
        'gasket supplier India',
        'industrial seals',
        ...(product.applications || []),
        ...(product.sizes || []).map((size) => `${product.name} ${size}`),
        product.temperatureRange ? `${product.temperatureRange} gasket` : '',
    ].filter(Boolean);
}