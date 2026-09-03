import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { AdminService } from '@/server/services/admin-service';
import { sanitizeString } from '@/validation/common-schema';

export async function PUT(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const name = sanitizeString(body?.name);
    const oldPass = body?.old_pass ? String(body.old_pass) : undefined;
    const newPass = body?.new_pass ? String(body.new_pass) : undefined;
    const confirmPass = body?.confirm_pass ? String(body.confirm_pass) : undefined;

    if (!name || name.length < 2) {
      return NextResponse.json({ status: 'error', message: 'Username must be at least 2 characters' }, { status: 400 });
    }

    const result = await AdminService.updateProfile(adminSession.id, name, oldPass, newPass, confirmPass);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
