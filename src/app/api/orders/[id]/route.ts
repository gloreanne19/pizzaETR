import { NextRequest, NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { OrderRepository } from '@/server/repositories/order-repo';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const orderId = parseInt(params.id, 10);
    const order = await OrderRepository.findById(orderId);
    if (!order || order.user_id !== session.id) {
      return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
    }

    const items = await OrderRepository.getItemsByOrderId(orderId);
    return NextResponse.json({ status: 'success', data: { order, items } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
