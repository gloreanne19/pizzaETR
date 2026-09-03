import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { AuthSession } from '@/server/db/schema';
import { env } from '@/server/env';

export function hashPassword(password: string): string {
  return crypto.createHash('sha1').update(password).digest('hex');
}

export function signToken(payload: AuthSession, expiresIn?: string): string {
  const expiry = expiresIn || (payload.role === 'user' ? '1h' : (env.jwt.expiresIn || '7d'));
  return jwt.sign(payload, env.jwt.secret, { expiresIn: expiry as any });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, env.jwt.secret) as AuthSession;
  } catch (error) {
    return null;
  }
}

export function getUserSessionFromCookies(): AuthSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(env.jwt.userCookie)?.value;
  if (!token) return null;
  const session = verifyToken(token);
  return session && session.role === 'user' ? session : null;
}

export function getAdminSessionFromCookies(): AuthSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(env.jwt.adminCookie)?.value;
  if (!token) return null;
  const session = verifyToken(token);
  return session && session.role === 'admin' ? session : null;
}

export async function getValidAdminSessionAsync(): Promise<AuthSession | null> {
  const session = getAdminSessionFromCookies();
  if (!session) return null;

  try {
    const { AdminRepository } = await import('@/server/repositories/admin-repo');
    const admin = await AdminRepository.findById(session.id);
    if (!admin) {
      clearAdminCookie();
      return null;
    }

    // Verify if this device/computer session matches the single active database session
    if (admin.session_id && session.sessionId && admin.session_id !== session.sessionId) {
      clearAdminCookie();
      return null;
    }

    return session;
  } catch (err) {
    return session;
  }
}

export function setUserCookie(session: AuthSession): void {
  // Customer token and cookie are strictly set to expire in 1 hour (3600 seconds)
  const token = signToken(session, '1h');
  cookies().set(env.jwt.userCookie, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });
}

export function setAdminCookie(session: AuthSession): void {
  const token = signToken(session, '7d');
  cookies().set(env.jwt.adminCookie, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearUserCookie(): void {
  cookies().delete(env.jwt.userCookie);
}

export function clearAdminCookie(): void {
  cookies().delete(env.jwt.adminCookie);
}
