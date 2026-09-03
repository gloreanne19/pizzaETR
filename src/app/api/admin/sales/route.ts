import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { SalesService } from '@/server/services/sales-service';

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productName = searchParams.get('product_name') || undefined;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;

    const result = await SalesService.getSalesAnalytics(productName, startDate, endDate);
    return NextResponse.json({ status: 'success', data: result });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
