import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { AdminService } from '@/server/services/admin-service';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    if (adminSession.name?.toLowerCase() !== 'root') {
      return NextResponse.json({ status: 'error', message: 'Access denied: Only root super-user can edit administrator credentials' }, { status: 403 });
    }

    const adminId = parseInt(params.id, 10);
    const body = await req.json();
    const { name, newPass } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ status: 'error', message: 'Admin username is required' }, { status: 400 });
    }

    const result = await AdminService.updateAdminCredentialsByRoot(adminId, name.trim(), newPass);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    if (adminSession.name?.toLowerCase() !== 'root') {
      return NextResponse.json({ status: 'error', message: 'Access denied: Only root super-user can delete administrators' }, { status: 403 });
    }

    const adminId = parseInt(params.id, 10);
    if (adminSession.id === adminId) {
      return NextResponse.json({ status: 'error', message: 'You cannot delete your own active root session' }, { status: 400 });
    }

    const result = await AdminService.deleteAdmin(adminId);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
