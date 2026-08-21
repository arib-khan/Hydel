// src/types/carousel.ts
// Homepage hero carousel slides, managed from the admin panel and rendered on
// the public home page ("/"). Each slide is either an uploaded image or video
// (stored on Cloudinary) and carries an explicit display order.

export type CarouselMediaType = 'image' | 'video';

export interface CarouselSlide {
  // Firestore document id.
  id: string;

  type: CarouselMediaType;

  // Public delivery URL (Cloudinary secure_url, or a bundled /home-images/*
  // path for the built-in default slides).
  src: string;

  // Cloudinary public_id, needed to delete the asset when a slide is removed.
  // Absent for the built-in default slides.
  publicId?: string;

  // Accessible description / video label. May be empty for decorative media.
  alt: string;

  // Lower numbers show first. Assigned on create, rewritten by reorder.
  position: number;

  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
}

// Shape accepted by the create/update admin API (server assigns id/position/
// timestamps). `alt` is optional here — some hero media is decorative, and the
// server defaults it to an empty string — which also matches the Zod schema.
export type CarouselSlideInput = Omit<
  CarouselSlide,
  'id' | 'position' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'alt'
> & { alt?: string };

// Minimal shape the public <Carousel> component needs to render a slide.
export type PublicCarouselSlide = Pick<CarouselSlide, 'type' | 'src' | 'alt'>;
