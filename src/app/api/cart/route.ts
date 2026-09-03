import { NextRequest, NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { CartService } from '@/server/services/cart-service';
import { validatePositiveInt } from '@/validation/common-schema';

export async function GET() {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const { items, grandTotal } = await CartService.getCart(session.id);
    return NextResponse.json({ status: 'success', data: { items, grandTotal } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const productId = validatePositiveInt(body?.product_id);
    const quantity = validatePositiveInt(body?.quantity) || 1;
    const options = body?.options || body?.custom_details || null;
    const unitPrice = body?.unit_price ? parseFloat(body.unit_price) : undefined;

    if (!productId) {
      return NextResponse.json({ status: 'error', message: 'Valid product_id is required' }, { status: 400 });
    }

    const result = await CartService.addToCart(session.id, productId, quantity, options, unitPrice);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message, data: { cartId: result.cartId } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const result = await CartService.clearCart(session.id);
    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
