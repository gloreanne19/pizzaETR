import { sanitizeString, validateNonNegativeFloat } from './common-schema';
import { ProductStatus } from '@/server/db/schema';

const VALID_STATUSES: ProductStatus[] = ['available', 'sold_out', 'unavailable', 'inactive'];

export function validateProductInput(input: any): {
  valid: boolean;
  error?: string;
  data?: {
    name: string;
    category: string;
    price: number;
    status: ProductStatus;
    has_customizations: boolean;
    customization_options?: string | null;
    description: string;
  };
} {
  const name = sanitizeString(input?.name);
  const rawCategory = sanitizeString(input?.category);
  const category = rawCategory || 'Pizza';
  const price = validateNonNegativeFloat(input?.price);
  const description = sanitizeString(input?.description);
  const has_customizations = Boolean(input?.has_customizations ?? (category.toLowerCase() === 'pizza'));
  let customization_options: string | null = null;
  if (typeof input?.customization_options === 'string') {
    customization_options = input.customization_options;
  } else if (input?.customization_options && typeof input.customization_options === 'object') {
    customization_options = JSON.stringify(input.customization_options);
  }

  let status: ProductStatus = 'available';
  const rawStatus = sanitizeString(input?.status) as ProductStatus;
  if (rawStatus && VALID_STATUSES.includes(rawStatus)) {
    status = rawStatus;
  }

  if (!name) return { valid: false, error: 'Product name is required' };
  if (price === null) return { valid: false, error: 'Invalid product price' };

  return {
    valid: true,
    data: { name, category, price, status, has_customizations, customization_options, description },
  };
}

export function validateSizeInput(input: any): {
  valid: boolean;
  error?: string;
  data?: { sizename: string; sizeprice: number };
} {
  const sizename = sanitizeString(input?.sizename);
  const sizeprice = validateNonNegativeFloat(input?.sizeprice);

  if (!sizename) return { valid: false, error: 'Size name is required' };
  if (sizeprice === null) return { valid: false, error: 'Invalid size price' };

  return { valid: true, data: { sizename, sizeprice } };
}

export function validateCustomizationInput(input: any): {
  valid: boolean;
  error?: string;
  data?: { cusName: string; cusPrice: number };
} {
  const cusName = sanitizeString(input?.cusName);
  const cusPrice = validateNonNegativeFloat(input?.cusPrice);

  if (!cusName) return { valid: false, error: 'Customization name is required' };
  if (cusPrice === null) return { valid: false, error: 'Invalid customization price' };

  return { valid: true, data: { cusName, cusPrice } };
}
