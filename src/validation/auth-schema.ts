import { sanitizeString, validateEmail } from './common-schema';

export function validateRegisterUser(input: any): { valid: boolean; error?: string; data?: { name: string; email: string; pass: string } } {
  const name = sanitizeString(input?.name);
  const email = sanitizeString(input?.email).toLowerCase();
  const pass = String(input?.pass || '');
  const cpass = String(input?.cpass || '');

  if (!name || name.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
  if (!email || !validateEmail(email)) return { valid: false, error: 'Invalid email address' };
  if (!pass || pass.length < 4) return { valid: false, error: 'Password must be at least 4 characters' };
  if (pass !== cpass) return { valid: false, error: 'Confirm password not matched!' };

  return { valid: true, data: { name, email, pass } };
}

export function validateLoginUser(input: any): { valid: boolean; error?: string; data?: { email: string; pass: string } } {
  const email = sanitizeString(input?.email).toLowerCase();
  const pass = String(input?.pass || '');

  if (!email) return { valid: false, error: 'Email is required' };
  if (!pass) return { valid: false, error: 'Password is required' };

  return { valid: true, data: { email, pass } };
}

export function validateAdminLogin(input: any): { valid: boolean; error?: string; data?: { name: string; pass: string } } {
  const name = sanitizeString(input?.name);
  const pass = String(input?.pass || '');

  if (!name) return { valid: false, error: 'Admin username is required' };
  if (!pass) return { valid: false, error: 'Password is required' };

  return { valid: true, data: { name, pass } };
}

export function validateAdminRegister(input: any): { valid: boolean; error?: string; data?: { name: string; pass: string } } {
  const name = sanitizeString(input?.name);
  const pass = String(input?.pass || '');
  const cpass = String(input?.cpass || '');

  if (!name || name.length < 2) return { valid: false, error: 'Username must be at least 2 characters' };
  if (!pass || pass.length < 4) return { valid: false, error: 'Password must be at least 4 characters' };
  if (pass !== cpass) return { valid: false, error: 'Confirm password not matched!' };

  return { valid: true, data: { name, pass } };
}

