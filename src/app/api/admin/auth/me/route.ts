import { NextResponse } from 'next/server';
import { getAdminSessionFromCookies, clearAdminCookie } from '@/lib/jwt';
import { AdminRepository } from '@/server/repositories/admin-repo';

export async function GET() {
  const session = getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Not authenticated as admin' }, { status: 401 });
  }

  const admin = await AdminRepository.findById(session.id);
  if (!admin) {
    clearAdminCookie();
    return NextResponse.json({ status: 'error', message: 'Admin account not found' }, { status: 404 });
  }

  // Real-time verification: check if this device's token matches the single active database session
  if (admin.session_id && session.sessionId && admin.session_id !== session.sessionId) {
    clearAdminCookie();
    return NextResponse.json({
      status: 'error',
      code: 'CONCURRENT_LOGIN',
      message: 'You have been logged out because this administrator account was accessed from another computer or browser.',
    }, { status: 401 });
  }

  return NextResponse.json({
    status: 'success',
    data: { admin: { id: admin.id, name: admin.name } },
  });
}
