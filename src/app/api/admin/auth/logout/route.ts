import { NextResponse } from 'next/server';
import { AuthService } from '@/server/services/auth-service';
import { getAdminSessionFromCookies } from '@/lib/jwt';

export async function POST() {
  const session = getAdminSessionFromCookies();
  await AuthService.logoutAdmin(session?.id);
  return NextResponse.json({ status: 'success', message: 'Admin logged out' });
}
