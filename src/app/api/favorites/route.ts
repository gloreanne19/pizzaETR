import { NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { FavoriteService } from '@/server/services/favorite-service';

export async function GET() {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await FavoriteService.getFavorites(session.id);
    return NextResponse.json({ status: 'success', data: { favorites } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
