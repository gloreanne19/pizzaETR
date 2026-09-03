import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRegister } from '@/validation/auth-schema';
import { AuthService } from '@/server/services/auth-service';
import { getAdminSessionFromCookies } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    if (adminSession.name?.toLowerCase() !== 'root') {
      return NextResponse.json({ status: 'error', message: 'Access denied: Only root super-user can register new administrators' }, { status: 403 });
    }

    const body = await req.json();
    const validation = validateAdminRegister(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ status: 'error', message: validation.error }, { status: 400 });
    }

    const { name, pass } = validation.data;
    const result = await AuthService.registerAdmin(name, pass);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message, data: { adminId: result.adminId } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
