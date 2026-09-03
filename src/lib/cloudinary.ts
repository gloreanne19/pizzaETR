import crypto from 'crypto';
import { env } from '@/server/env';

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/**
 * Check if Cloudinary credentials are fully configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.cloudinary.cloudName &&
    env.cloudinary.apiKey &&
    env.cloudinary.apiSecret &&
    env.cloudinary.cloudName.trim() !== '' &&
    env.cloudinary.apiKey.trim() !== '' &&
    env.cloudinary.apiSecret.trim() !== ''
  );
}

/**
 * Upload a file Buffer directly to Cloudinary using standard REST API
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = 'pizza_etr/products',
  publicId?: string
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not configured in environment variables');
  }

  const cloudName = env.cloudinary.cloudName.trim();
  const apiKey = env.cloudinary.apiKey.trim();
  const apiSecret = env.cloudinary.apiSecret.trim();
  const timestamp = Math.round(Date.now() / 1000);

  // Generate SHA-1 signature for authenticated upload
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };
  if (publicId) {
    paramsToSign.public_id = publicId;
  }

  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)]);
  formData.append('file', blob);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  if (publicId) {
    formData.append('public_id', publicId);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
  }

  return {
    url: data.url,
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  };
}

/**
 * Delete an image from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  if (!isCloudinaryConfigured()) return null;

  try {
    const cloudName = env.cloudinary.cloudName.trim();
    const apiKey = env.cloudinary.apiKey.trim();
    const apiSecret = env.cloudinary.apiSecret.trim();
    const timestamp = Math.round(Date.now() / 1000);

    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    return null;
  }
}
