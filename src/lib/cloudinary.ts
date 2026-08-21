// src/lib/cloudinary.ts
// Server-only Cloudinary helpers. The API secret never reaches the browser -
// the admin UI asks this server for a signature, then uploads directly to
// Cloudinary using that signature (unsigned-from-the-browser, signed-by-us).
import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, ' +
        'and CLOUDINARY_API_SECRET (see .env.example).'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

const PRODUCT_FOLDER = 'hydel/products';
const CAROUSEL_FOLDER = 'hydel/carousel';

/**
 * Generates a signature for a signed, direct-from-browser upload to
 * Cloudinary. The browser then POSTs the file straight to Cloudinary with
 * these params - the file itself never passes through our server or
 * Firestore. Only `folder` and `timestamp` are signed, so the SAME signature
 * works for both the image and video upload endpoints (resource_type lives in
 * the request URL, not the signed params).
 */
function createUploadSignature(folder: string) {
  const cld = configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cld.utils.api_sign_request(paramsToSign, cld.config().api_secret as string);

  return {
    timestamp,
    folder,
    signature,
    apiKey: cld.config().api_key,
    cloudName: cld.config().cloud_name,
  };
}

/** Signed upload target for product images. */
export function createProductUploadSignature() {
  return createUploadSignature(PRODUCT_FOLDER);
}

/** Signed upload target for homepage carousel media (images or videos). */
export function createCarouselUploadSignature() {
  return createUploadSignature(CAROUSEL_FOLDER);
}

/**
 * Deletes a Cloudinary asset by public_id. Videos must be destroyed with
 * resource_type 'video', so callers pass the slide's media type through.
 */
export async function deleteAsset(publicId: string, resourceType: 'image' | 'video' = 'image') {
  const cld = configureCloudinary();
  return cld.uploader.destroy(publicId, { resource_type: resourceType });
}

/** Deletes a Cloudinary image asset (used when replacing/removing a product image). */
export async function deleteProductImage(publicId: string) {
  return deleteAsset(publicId, 'image');
}
