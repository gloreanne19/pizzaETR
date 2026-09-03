import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { UserService } from '@/server/services/user-service';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Only root user has permission to delete customer accounts
    if (adminSession.name?.toLowerCase() !== 'root') {
      return NextResponse.json({ status: 'error', message: 'Access denied: Only root super-user can delete customer accounts' }, { status: 403 });
    }

    const userId = parseInt(params.id, 10);
    const result = await UserService.deleteUser(userId);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
