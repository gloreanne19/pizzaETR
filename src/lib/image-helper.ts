/**
 * Universal Image URL Helper
 * Safely resolves Cloudinary CDN URLs, local uploaded images, and static assets with fallback.
 */

export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return '/images/home-img-1.png';
  }

  const trimmed = imagePath.trim();

  // If already a full remote URL (Cloudinary, AWS S3, etc.)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If already an absolute path starting with / (e.g. /images/... or /uploaded_img/...)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Relative filename from uploaded_img (e.g. "Pepperoni.png" or "11.png")
  return `/uploaded_img/${trimmed}`;
}

