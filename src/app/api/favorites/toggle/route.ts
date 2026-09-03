import { NextRequest, NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { FavoriteService } from '@/server/services/favorite-service';
import { validatePositiveInt } from '@/validation/common-schema';

export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const productId = validatePositiveInt(body?.product_id);
    if (!productId) {
      return NextResponse.json({ status: 'error', message: 'Valid product_id is required' }, { status: 400 });
    }

    const result = await FavoriteService.toggleFavorite(session.id, productId);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message, action: result.action });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
