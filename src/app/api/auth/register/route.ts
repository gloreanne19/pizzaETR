import { NextRequest, NextResponse } from 'next/server';
import { validateRegisterUser } from '@/validation/auth-schema';
import { AuthService } from '@/server/services/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRegisterUser(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ status: 'error', message: validation.error }, { status: 400 });
    }

    const { name, email, pass } = validation.data;
    const result = await AuthService.registerUser(name, email, pass);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message, data: { userId: result.userId } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
