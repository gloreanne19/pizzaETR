import { sanitizeString, validatePhone } from './common-schema';

export function validateOrderInput(input: any): {
  valid: boolean;
  error?: string;
  data?: {
    name: string;
    number: string;
    method: string;
    address: string;
    delivery_notes?: string;
    payment_proof?: string;
    order_type: 'delivery' | 'pickup';
    lat?: number | null;
    lng?: number | null;
    save_address_label?: string;
  };
} {
  const name = sanitizeString(input?.name);
  const number = sanitizeString(input?.number);
  const method = sanitizeString(input?.method) || 'Cash on delivery';
  const order_type: 'delivery' | 'pickup' = input?.order_type === 'pickup' ? 'pickup' : 'delivery';
  let address = sanitizeString(input?.address);
  const delivery_notes = sanitizeString(input?.delivery_notes);
  const payment_proof = sanitizeString(input?.payment_proof);
  const save_address_label = sanitizeString(input?.save_address_label);
  const lat = typeof input?.lat === 'number' && !isNaN(input.lat) ? input.lat : null;
  const lng = typeof input?.lng === 'number' && !isNaN(input.lng) ? input.lng : null;

  if (!name) return { valid: false, error: 'Customer name is required' };
  if (!number || !validatePhone(number)) return { valid: false, error: 'Valid contact phone number is required' };

  if (order_type === 'delivery') {
    if (!address || address.length < 5) {
      return { valid: false, error: 'Full delivery address or pinned map location is required for delivery' };
    }
  } else {
    if (!address) {
      address = 'Store Pickup (Counter Collection)';
    }
  }

  // If method is online payment, payment_proof is recommended
  return {
    valid: true,
    data: { name, number, method, address, delivery_notes, payment_proof, order_type, lat, lng, save_address_label },
  };
}
