import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies, hashPassword } from '@/lib/jwt';
import { UserService } from '@/server/services/user-service';
import { UserRepository } from '@/server/repositories/user-repo';
import { validateRegisterUser } from '@/validation/auth-schema';

export async function GET() {
  const adminSession = getAdminSessionFromCookies();
  if (!adminSession) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  // Only root user has permission to manage customer accounts
  if (adminSession.name?.toLowerCase() !== 'root') {
    return NextResponse.json({ status: 'error', message: 'Access denied: Only root super-user can view customer accounts' }, { status: 403 });
  }

  const users = await UserService.getAllUsers();
  return NextResponse.json({ status: 'success', data: { users } });
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    if (adminSession.name?.toLowerCase() !== 'root') {
      return NextResponse.json({ status: 'error', message: 'Access denied: Only root super-user can create customer accounts' }, { status: 403 });
    }

    const body = await req.json();
    const validation = validateRegisterUser(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ status: 'error', message: validation.error }, { status: 400 });
    }

    const { name, email, pass } = validation.data;
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json({ status: 'error', message: 'A customer account with this email already exists' }, { status: 400 });
    }

    const passwordHash = hashPassword(pass);
    const userId = await UserRepository.create(name, email, passwordHash);

    return NextResponse.json({
      status: 'success',
      message: `Customer account "${name}" (${email}) created successfully!`,
      data: { userId },
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
