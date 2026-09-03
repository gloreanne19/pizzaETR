import { NextResponse } from 'next/server';
import { AuthService } from '@/server/services/auth-service';

export async function POST() {
  AuthService.logoutUser();
  return NextResponse.json({ status: 'success', message: 'Logged out successfully' });
}
