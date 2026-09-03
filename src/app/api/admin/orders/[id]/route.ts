import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { OrderService } from '@/server/services/order-service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const orderId = parseInt(params.id, 10);
    const body = await req.json();
    const { status, cancellation_reason } = body;

    if (!status || !['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ status: 'error', message: 'Invalid order status' }, { status: 400 });
    }

    const result = await OrderService.updateOrderStatus(orderId, status, cancellation_reason);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const orderId = parseInt(params.id, 10);
    const result = await OrderService.deleteOrder(orderId);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
