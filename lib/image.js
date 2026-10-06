import { ALLOWED_IMAGE_TYPES, LIMITS } from './config';

const MAX_DIMENSION = 1600;
const TARGET_BYTES = 3 * 1024 * 1024; // keep request bodies well under host limits (Vercel ≈ 4.5 MB)

/**
 * Validates a user-selected image (jpg/png, ≤ 5 MB) and returns a
 * downscaled JPEG data URL suitable for the vision model.
 * Throws an Error with a user-friendly message on failure.
 */
export async function prepareImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error('Only JPG or PNG images are supported.');
  if (file.size > LIMITS.maxImageBytes) throw new Error('Image is too large. Max size is 5 MB.');

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read that image. Try another one.'));
      el.src = bitmapUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(32, Math.round(img.width * scale)); // vision models need ≥ 32px
    canvas.height = Math.max(32, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // flatten transparent PNGs onto white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.88;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length * 0.75 > TARGET_BYTES && quality > 0.4) {
      quality -= 0.12;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}
