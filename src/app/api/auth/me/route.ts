import { NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { UserService } from '@/server/services/user-service';

export async function GET() {
  const session = getUserSessionFromCookies();
  if (!session) {
    return NextResponse.json({ status: 'error', message: 'Not authenticated' }, { status: 401 });
  }

  const { user, stats } = await UserService.getUserProfileWithStats(session.id);
  if (!user) {
    return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: 'success',
    data: { user, stats },
  });
}
