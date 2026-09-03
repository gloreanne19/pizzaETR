import { NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { DashboardService } from '@/server/services/dashboard-service';

export async function GET() {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const stats = await DashboardService.getOverviewStats();
    return NextResponse.json({ status: 'success', data: { stats } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
