import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { OrderService } from '@/server/services/order-service';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const orderId = parseInt(params.id, 10);
    const result = await OrderService.completePayment(orderId);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
