import { NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { AdminService } from '@/server/services/admin-service';

export async function GET() {
  const adminSession = getAdminSessionFromCookies();
  if (!adminSession) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  // Only root user has permission to manage administrator accounts
  if (adminSession.name?.toLowerCase() !== 'root') {
    return NextResponse.json({ status: 'error', message: 'Access denied: Only root super-user can view administrator accounts' }, { status: 403 });
  }

  const admins = await AdminService.getAllAdmins(true);
  return NextResponse.json({ status: 'success', data: { admins } });
}
