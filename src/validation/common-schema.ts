export function sanitizeString(val: any): string {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/<[^>]*>?/gm, '');
}

export function validatePositiveInt(val: any): number | null {
  const num = parseInt(String(val), 10);
  if (isNaN(num) || num <= 0) return null;
  return num;
}

export function validateNonNegativeFloat(val: any): number | null {
  const num = parseFloat(String(val));
  if (isNaN(num) || num < 0) return null;
  return num;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9+()-\s]{7,20}$/;
  return phoneRegex.test(phone);
}

