import path from 'path';
import fs from 'fs/promises';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from './cloudinary';

/**
 * Sanitizes a title to generate a clean, readable filename based on product or entity name.
 * E.g. "Lemon Iced Tea" -> "Lemon Iced Tea.png"
 * "Crispy Chicken & Dip!" -> "Crispy Chicken and Dip.png"
 */
export function formatFileNameFromTitle(title: string, originalFileName?: string): string {
  const ext = originalFileName ? path.extname(originalFileName) : '.png';

  // Replace & with and, remove illegal filesystem/URL characters
  const cleanTitle = title
    .trim()
    .replace(/&/g, 'and')
    .replace(/[<>:"/\\|?*#%{}()\\$!'@+`=]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const finalBase = cleanTitle || 'product';
  return `${finalBase}${ext || '.png'}`;
}

export async function saveUploadedFile(
  file: File,
  targetSubdir: string = 'uploaded_img',
  preferredName?: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let fileName: string;
  if (preferredName && preferredName.trim().length > 0) {
    fileName = formatFileNameFromTitle(preferredName, file.name);
  } else {
    const ext = path.extname(file.name) || '.png';
    const originalBase = path.basename(file.name, ext);
    fileName = formatFileNameFromTitle(originalBase, file.name);
  }

  // If Cloudinary is configured, upload directly and return secure CDN URL
  if (isCloudinaryConfigured()) {
    try {
      const publicBase = path.basename(fileName, path.extname(fileName));
      const res = await uploadBufferToCloudinary(buffer, `pizza_etr/${targetSubdir}`, publicBase);
      if (res && res.secure_url) {
        return res.secure_url;
      }
    } catch (error) {
      console.warn('Cloudinary upload error, falling back to local storage:', error);
    }
  }

  // Fallback to local disk storage
  const targetDir = path.join(process.cwd(), 'public', targetSubdir);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, fileName), buffer);

  return fileName;
}
