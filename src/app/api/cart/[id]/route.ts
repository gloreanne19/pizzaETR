import { NextRequest, NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { CartService } from '@/server/services/cart-service';
import { validatePositiveInt } from '@/validation/common-schema';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const cartId = parseInt(params.id, 10);
    const body = await req.json();
    const quantity = validatePositiveInt(body?.quantity);

    if (!quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json({ status: 'error', message: 'Quantity must be between 1 and 100' }, { status: 400 });
    }

    const result = await CartService.updateQuantity(cartId, session.id, quantity);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const cartId = parseInt(params.id, 10);
    const result = await CartService.removeItem(cartId, session.id);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
